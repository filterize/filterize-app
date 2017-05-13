import { Component, OnInit, OnDestroy } from "@angular/core";
import { Store } from "@ngrx/store";
import { AppState } from "../../app/appstate";
import { UserService } from "../../services/user.service";
import { Http } from "@angular/http";
import { TranslateService } from "ng2-translate";
import { NavParams, ViewController, ModalController, LoadingController, ToastController } from "ionic-angular";
import { Subscription, Observable } from "rxjs";
import { AddressChangeComponent } from "../../tools/address-change.component";
import * as UserActions from "../../user/user.actions";
import * as braintree from "braintree-web";
import { CONFIG } from "../../app/config";
import { jwtHeaderOnlyOptions } from "../../user/user.tools";


@Component({
  template: `
  <ion-header>
      <ion-navbar>
        <ion-buttons left>
          <button ion-button icon-only (click)="dismiss()">
            <ion-icon name="close"></ion-icon>
          </button>
        </ion-buttons>
        <ion-title>
          <ion-icon name="cart"></ion-icon>
          {{ "PAYMENT.ORDER" | translate }}
        </ion-title>
      </ion-navbar>
    </ion-header>
    
    <ion-content> 
      <form>
        <ion-card *ngIf="subscription">
          <ion-card-header>{{ "PAYMENT.SUBSCRIPTION" | translate}}</ion-card-header>
          <ion-card-content>
            {{ "PAYMENT.PLAN" | translate }}: <strong>{{ "PAYMENT." + plan | translate}}</strong><br>
            {{ price | currency:currency:true }}
            <span *ngIf="annually">/{{ "PAYMENT.YEAR" | translate}}</span>
            <span *ngIf="!annually">/{{ "PAYMENT.MONTH" | translate}}</span>
          </ion-card-content>
        </ion-card>
  
        <ion-card *ngIf="!subscription">
          <ion-card-header>{{ "PAYMENT.ONE_TIME_BUY" | translate}}</ion-card-header>
          <ion-card-content>
            {{ "PAYMENT.PLAN" | translate }}: <strong>{{ "PAYMENT." + plan | translate}}</strong><br>
            {{ price | currency:currency:true }}<br>
            1
            <span *ngIf="annually">/{{ "PAYMENT.YEAR" | translate}}</span>
            <span *ngIf="!annually">/{{ "PAYMENT.MONTH" | translate}}</span>
          </ion-card-content>
        </ion-card>
        
        <ion-card (click)="editAddress()">
          <ion-card-header>{{ "PAYMENT.BILLING_ADDRESS" | translate}}</ion-card-header>
          <ion-card-content>
            <filterize-address [obj]="current_user"></filterize-address>
          </ion-card-content>
        </ion-card>
        
        <ion-card>
          <ion-card-header>{{ "PAYMENT.TITLE" | translate }}</ion-card-header>
          <ion-card-content>
            <div id="braintree_form"></div>
          </ion-card-content>
        </ion-card>
        
        <button ion-button type="submit" block>{{ "PAYMENT.ORDER_NOW" | translate }}</button>
      </form>
      
    </ion-content>
`,
})
export class OrderComponent implements OnInit, OnDestroy {
  subscription: boolean;
  plan: number;
  plan_label: string;
  currency: string;
  annually: boolean;
  price: number;
  current_user: any;
  sub: Subscription;
  changed_address_data = null;
  token: string;

  constructor(private store: Store<AppState>,
              private userSrv: UserService,
              private http: Http,
              private params: NavParams,
              private viewCtrl: ViewController,
              private modalCtrl: ModalController,
              private loadingCtrl: LoadingController,
              private toastCtrl: ToastController,
              private translate: TranslateService) {
  }

  ngOnInit() {
    this.subscription = this.params.get("subscription");
    this.plan = this.params.get("plan");
    this.plan_label = this.params.get("plan_label");
    this.currency = this.params.get("currency");
    this.annually = this.params.get("annually");
    this.price = this.params.get("price");
    this.token = this.params.get("token");

    this.sub = this.userSrv.getCurrentUser().subscribe(user => {
      this.current_user = user;
    });
    this.changed_address_data = null;
    if (this.token) {
      this.init_braintree();
    } else {
      this.http.get(
        `${CONFIG.filterize.api_url}/user/${this.current_user.user_id}/payment/token`,
        jwtHeaderOnlyOptions(this.current_user.access_token),
      )
        .map(result => result.json())
        .subscribe(data => {this.token = data.data; this.init_braintree(); console.log("token data recv", data)})
    }

  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  editAddress() {
    let modal = this.modalCtrl.create(AddressChangeComponent, {obj: this.current_user});
    modal.onDidDismiss(data => {
      if (data != null) {
        this.store.dispatch({
          type: UserActions.CHANGED,
          payload: Object.assign({}, {_id: this.current_user._id}, data)
        });
        this.changed_address_data = data;
      }
    });
    modal.present();
  }

  init_braintree() {
    console.log("token2setup", this.token);
    braintree.setup(this.token, "dropin", {
      container: "braintree_form",
      dataCollector: {
        // kount: {environment: window.KOUNT_ENV},
        paypal: true,
      },
      paypal: {
        enableShippingAddress: true
      },
      onPaymentMethodReceived: (data:{nonce: string}) => {
        this.order(data.nonce)
      }
      // onReady: (braintreeInstance) =>
      //   $("#device_data").val(braintreeInstance.deviceData)
    })
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  order(nonce) {
    let data = {
      currency: this.currency,
      cycle: this.annually ? "annually" : "monthly",
      payment_method_nonce: nonce,
      method: this.subscription ? "subscription": "onetime",
      level: this.plan_label
    };

    let loading = this.loadingCtrl.create();
    this.translate.get("UI.LOADING").subscribe(content => {
      loading.setContent(content);
    });
    loading.present();


    this.http.post(
      `${CONFIG.filterize.api_url}/user/${this.current_user.user_id}/payment/order`,
      data,
      jwtHeaderOnlyOptions(this.current_user.access_token),
    )
      .map(result => result.json())
      .subscribe(data => this.orderResultHttpOk(data, loading), err => this.orderResultHttpError(err, loading))

    console.log("order data:", data);
  }

  orderResultHttpOk(data, loading) {
    console.log("order recv", data);
    loading.dismiss();
    this.translate.get(data.data.msg).subscribe(trans => {
      let toast = this.toastCtrl.create({
        message: trans,
        duration: 3000
      });
      toast.present();
    });
    this.store.dispatch({
      type: UserActions.CHANGED,
      payload: Object.assign({}, {_id: this.current_user._id}, data.user)
    });
    this.viewCtrl.dismiss(data.data.success);
  }

  orderResultHttpError(error, loading) {
    console.log("could not place order");
    loading.dismiss();
    this.translate.get("PAYMENT.ERROR").subscribe(trans => {
      let toast = this.toastCtrl.create({
        message: trans,
        duration: 3000
      });
      toast.present();
    });
    this.viewCtrl.dismiss(false);
  }

  submit(form, event:Event) {
    event.preventDefault();
    console.log("submit");
    console.log(form);
    return false;
  }
}
