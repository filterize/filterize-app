import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store'
import { AppState } from "../../app/appstate";
import * as UserActions from "../../user/user.actions";
import { Actions } from "@ngrx/effects";
import { AlertController, ModalController } from "ionic-angular";
import { TranslateService } from "ng2-translate";
import { UserService } from "../../services/user.service";
import { Subscription } from "rxjs";
import { Http } from "@angular/http";
import { jwtHeaderOnlyOptions } from "../../user/user.tools";
import { CONFIG } from "../../app/config";
import { OrderComponent } from "./order.component";


@Component({
  template: `
    <ion-header>
      <ion-navbar>
        
        <button ion-button icon-only menuToggle>
          <ion-icon name="menu"></ion-icon>
        </button>
    
        <ion-title>
          <ion-icon name="card"></ion-icon>
          {{ "PAYMENT.TITLE" | translate }}
        </ion-title>
      </ion-navbar>
    </ion-header>
    
    <ion-content>  
      <filterize-tbd feature="payment"></filterize-tbd>
      <ion-segment [(ngModel)]="annually" (ionChange)="updateParams()">
        <ion-segment-button [value]="true">
          {{ "PAYMENT.PAY_ANNUALLY" | translate }}
        </ion-segment-button>
        <ion-segment-button [value]="false">
          {{ "PAYMENT.PAY_MONTHLY" | translate }}
        </ion-segment-button>
      </ion-segment>
      
      <ion-list>
        <ion-item>
          <ion-label>{{ "PAYMENT.CURRENCY" | translate }}</ion-label>
          <ion-select [(ngModel)]="currency" (ionChange)="updateParams()">
            <ion-option value="EUR">&euro; EUR</ion-option>
            <ion-option value="USD">$ USD</ion-option>
          </ion-select>
        </ion-item>
      </ion-list>
    
      <ion-grid no-padding>
        <ion-row no-padding>
          <ion-col col-12 col-md>
            <ion-card>
              <ion-card-header>{{ "PAYMENT.0" | translate }}</ion-card-header>
              <ion-card-content>
                <p>
                  <ion-icon name="checkmark-circle"></ion-icon> &nbsp;
                  {{ "PAYMENT.HIERARCHY" | translate}}
                </p>
                <p>
                  <ion-icon name="checkmark-circle"></ion-icon> &nbsp;
                  <strong>3</strong>
                  {{ "PAYMENT.FILTER" | translate}}
                </p>
                <p color="light">
                  <ion-icon name="close-circle"></ion-icon> &nbsp;
                  {{ "PAYMENT.CALENDAR" | translate}}
                </p>
                <p color="light">
                  <ion-icon name="close-circle"></ion-icon> &nbsp;
                  {{ "PAYMENT.MAIL" | translate}}
                </p>
              </ion-card-content>
              <ion-row no-padding>
                <ion-col no-padding *ngIf="subscription">
                  <button ion-button small clear block (click)="doUnsubscribe()">
                    <!--<ion-icon name='redo'></ion-icon>-->
                    {{ "PAYMENT.SWITCH" | translate }}
                  </button>
                </ion-col>
                <ion-col center text-center>
                  <strong color="danger">
                    {{ "PAYMENT.DOWNGRADE" | translate }}
                    {{ user?.valid_until * 1000 | filterize_date: "date-time"}}
                  </strong>
                </ion-col>
              </ion-row>
            </ion-card>
          </ion-col>
          <ion-col col-12 col-md>
            <ion-card>
              <ion-item>
                <h2>{{ "PAYMENT.1" | translate }}</h2>
                <strong item-right>{{ prices.plus|currency:currency:true}}</strong>
              </ion-item>
              <ion-card-content>
                <p>
                  <ion-icon name="checkmark-circle"></ion-icon> &nbsp;
                  {{ "PAYMENT.HIERARCHY" | translate}}
                </p>
                <p>
                  <ion-icon name="checkmark-circle"></ion-icon> &nbsp;
                  <strong>10</strong>
                  {{ "PAYMENT.FILTER" | translate}}
                </p>
                <p>
                  <ion-icon name="checkmark-circle"></ion-icon> &nbsp;
                  <strong>2</strong>
                  {{ "PAYMENT.CALENDAR" | translate}}
                </p>
                <p color="light">
                  <ion-icon name="close-circle"></ion-icon> &nbsp;
                  {{ "PAYMENT.MAIL" | translate}}
                </p>
              </ion-card-content>
              <ion-row no-padding>
                <ion-col no-padding *ngIf="!subscription">
                  <button ion-button small clear block (click)="doSubscribe(1)"> <!-- icon-left-->
                    <!--<ion-icon name='card'></ion-icon>-->
                    {{ "PAYMENT.SUBSCRIBE" | translate }}
                  </button>
                </ion-col>
                <ion-col no-padding *ngIf="!subscription">
                  <button ion-button small clear block (click)="doBuy(1)">
                    <!--<ion-icon name='cart'></ion-icon>-->
                    {{ "PAYMENT.BUY" | translate }}
                  </button>
                </ion-col>
                <ion-col no-padding *ngIf="user.validation_level == 2">
                  <button ion-button small clear block (click)="doSwitch(1)">
                    <!--<ion-icon name='redo'></ion-icon>-->
                    {{ "PAYMENT.SWITCH" | translate }}
                  </button>
                </ion-col>
                <ion-col no-padding *ngIf="subscription && user.validation_level == 1">
                  <button ion-button small clear block (click)="doUnsubscribe()">
                    <!--<ion-icon name='redo'></ion-icon>-->
                    {{ "PAYMENT.SUBSCRIBE_CANCEL" | translate }}
                  </button>
                </ion-col>
              </ion-row>
            </ion-card>
          </ion-col>
          <ion-col col-12 col-md>
            <ion-card>
              <ion-item>
                <h2>{{ "PAYMENT.2" | translate }}</h2>
                <strong item-right>{{ prices.premium|currency:currency:true}}</strong>
              </ion-item>
              <ion-card-content>
                <p>
                  <ion-icon name="checkmark-circle"></ion-icon> &nbsp;
                  {{ "PAYMENT.HIERARCHY" | translate}}
                </p>
                <p>
                  <ion-icon name="checkmark-circle"></ion-icon> &nbsp;
                  <strong>{{ "PAYMENT.INF" | translate}}</strong>
                  {{ "PAYMENT.FILTER" | translate}}
                </p>
                <p>
                  <ion-icon name="checkmark-circle"></ion-icon> &nbsp;
                  <strong>{{ "PAYMENT.INF" | translate}}</strong>
                  {{ "PAYMENT.CALENDAR" | translate}}
                </p>
                <p>
                  <ion-icon name="checkmark-circle"></ion-icon> &nbsp;
                  {{ "PAYMENT.MAIL" | translate}}
                </p>
              </ion-card-content>
              <ion-row no-padding>
                <ion-col no-padding *ngIf="!subscription">
                  <button ion-button small clear block (click)="doSubscribe(2)"> <!-- icon-left-->
                    <!--<ion-icon name='card'></ion-icon>-->
                    {{ "PAYMENT.SUBSCRIBE" | translate }}
                  </button>
                </ion-col>
                <ion-col no-padding *ngIf="!subscription">
                  <button ion-button small clear block (click)="doBuy(2)">
                    <!--<ion-icon name='cart'></ion-icon>-->
                    {{ "PAYMENT.BUY" | translate }}
                  </button>
                </ion-col>
                <ion-col no-padding *ngIf="user.validation_level == 1">
                  <button ion-button small clear block (click)="doSwitch(2)">
                    <!--<ion-icon name='redo'></ion-icon>-->
                    {{ "PAYMENT.SWITCH" | translate }}
                  </button>
                </ion-col>
                <ion-col no-padding *ngIf="subscription && user.validation_level == 2">
                  <button ion-button small clear block (click)="doUnsubscribe()">
                    <!--<ion-icon name='redo'></ion-icon>-->
                    {{ "PAYMENT.SUBSCRIBE_CANCEL" | translate }}
                  </button>
                </ion-col>
              </ion-row>
            </ion-card>
          </ion-col>
          
        </ion-row>
      </ion-grid>
    </ion-content>
  `
})
export class PaymentComponent implements OnInit, OnDestroy {
  currency:string = "EUR";
  annually:boolean = true;
  subscription:{
    "next_capture": number,
    "currency": string,
    "plan": number,
    "annually": boolean
  } = null;
  sub:Subscription = null;
  pricing: any = null;
  user: any = null;
  digits = 1;
  prices = {
    plus: 0,
    premium: 0
  };
  token: string = null;


  constructor(private store: Store<AppState>,
              private actions$: Actions,
              private alertCtrl: AlertController,
              private modalCtrl: ModalController,
              private userSrv: UserService,
              private http: Http,
              private translate: TranslateService) {
  }

  updateParams() {
    if (this.subscription) {
      this.currency = this.subscription.currency;
      this.annually = this.subscription.annually;
    } else if (this.user) {
      this.http.get(
        `${CONFIG.filterize.api_url}/user/${this.user.user_id}/payment/token`,
        jwtHeaderOnlyOptions(this.user.access_token),
      )
        .map(result => result.json())
        .subscribe(data => {this.token = data.data; console.log("token data recv", data)})
    }
    let intervalstring = this.annually ? "annually" : "monthly";
    if (this.pricing) {
      this.prices.plus = this.pricing[this.currency][1][intervalstring];
      this.prices.premium = this.pricing[this.currency][2][intervalstring];
    }
  }

  ngOnInit() {
    this.sub = this.userSrv.getCurrentUser()
      .filter(user => user)
      .subscribe(user => {
        this.user = user;
        this.subscription = user["subscription"];
        this.pricing = user["pricing"];
        this.updateParams();
      })
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  doBuy(plan) {
    this.openOrder(false, plan);
  }

  doSubscribe(plan) {
    this.openOrder(true, plan);
  }

  openOrder(subscription: boolean, plan) {
    let p_label = plan == 1 ? "plus" : "premium";
    console.log("token", this.token);
    let modal = this.modalCtrl.create(OrderComponent, {
      subscription: subscription,
      plan: plan,
      plan_label: p_label,
      currency: this.currency,
      annually: this.annually,
      price: this.prices[p_label],
      token: this.token,
    });
    modal.present();
  }

  doSwitch(plan) {
    console.log("switch", plan);
  }

  doUnsubscribe() {
    console.log("unsubscribe");
  }

}
