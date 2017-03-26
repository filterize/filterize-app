import { Component } from '@angular/core';
import { Store } from '@ngrx/store'
import { AppState } from "../../app/appstate";
import * as UserActions from "../../user/user.actions";
import { Actions } from "@ngrx/effects";
import { AlertController, NavController, ModalController } from "ionic-angular";
import { TranslateService } from "ng2-translate";
import { Observable, Subscription } from "rxjs";
import { UserService } from "../../services/user.service";
import { CountryService } from "../../services/country.service";
import { PaymentComponent } from "../payment/payment.component";
import { AddressChangeComponent } from "../../tools/address-change.component";
import { EvernoteService } from "../../services/evernote.service";


@Component({
  template: `
    <ion-header>
      <ion-navbar>
        
        <button ion-button icon-only menuToggle>
          <ion-icon name="menu"></ion-icon>
        </button>
    
        <ion-title>
          <ion-icon name="speedometer"></ion-icon>
          {{ "DASHBOARD.TITLE" | translate }}
        </ion-title>
      </ion-navbar>
    </ion-header>
    
    <ion-content>  
    <ion-card *ngIf="current_user.user_id">
      <ion-card-header>Profile</ion-card-header>
      
      <ion-list>
        <button ion-item (click)="editAddress()">
          <p>
            <strong>{{ current_user?.email }}</strong><br>
            <filterize-address [obj]="current_user"></filterize-address>
          </p>
        </button>
        
        <button ion-item (click)="gotoPayment()">
          {{ "PAYMENT.CURRENT_PLAN" | translate }}: 
          <strong *ngIf="current_user?.business_paying">{{ "PAYMENT.BUSINESS" | translate }}</strong>
          <strong *ngIf="!(current_user?.business_paying)">
            {{ "PAYMENT." + (current_user?.validation_level) | translate }}
          </strong>
          <span *ngIf="!(current_user?.business_paying) && (current_user?.validation_level > 0)">
            <br>
            <span *ngIf="current_user?.subscription?.next_capture">
              {{ "PAYMENT.NEXT_CAPTURE" | translate}}:
              {{ current_user.subscription.next_capture | filterize_date: "date"}}
            </span>
            <span *ngIf="!(current_user?.valid_until)">
              {{ "PAYMENT.VALID_UNTIL" | translate}}:
              {{ current_user.valid_until | filterize_date: "date"}}
            </span>
          </span>
        </button>
      </ion-list>
    </ion-card>
     
    <ion-card *ngIf="current_user.token_expires">
      <ion-card-header>Evernote</ion-card-header>
      <ion-list>
        <ion-item>
          {{ "DASHBOARD.EVERNOTE_VALID_UNTIL" | translate }}
          <ion-note item-right>
            {{ current_user.token_expires * 1000 | filterize_date: "date-time" }}
          </ion-note>
        </ion-item>
        <ion-item text-wrap *ngIf="rate_limited">
          <ion-icon name="alert" color="danger"></ion-icon>
          {{ "DASHBOARD.EVERNOTE_RATE_LIMIT_UNTIL" | translate }}
          <p>{{ "DASHBOARD.EVERNOTE_RATE_LIMIT_DESCRIPTION" | translate }}</p>
          <ion-note item-right>
            {{ current_user.rate_limit_until * 1000 | filterize_date: "date-time" }}
          </ion-note>
        </ion-item>
        <ion-item> 
          <button ion-button round (click)="validateEvernote()">
            {{ "DASHBOARD.EVERNOTE_REVALIDATE" | translate}}
          </button>
        </ion-item>
      </ion-list>
    </ion-card>
     
    <ion-card *ngIf="!current_user.token_expires">
      <ion-card-header>Evernote</ion-card-header>
      <ion-card-content text-wrap>
        <p>{{ "DASHBOARD.EVERNOTE_CONNECT_MESSAGE" | translate }}</p>
        
        <button ion-button round (click)="validateEvernote()">
          {{ "DASHBOARD.EVERNOTE_VALIDATE" | translate}}
        </button>
      </ion-card-content>
    </ion-card>
    
    <ion-card *ngIf="current_user.business">
      <ion-card-header>{{ "BUSINESS.TITLE" | translate}}: {{current_user.business.name}}</ion-card-header>
      <ion-list>
        <ion-item>
          {{ "BUSINESS.ROLE.LABEL" | translate}}
          <ion-note item-right>{{ "BUSINESS.ROLE." + current_user.business_role | translate }}</ion-note>
        </ion-item>
      </ion-list>
    </ion-card>
     
    </ion-content>
  `
})
export class DashboardComponent {
  current_user$: Observable<any>;
  current_user: any;
  sub: Subscription = null;
  rate_limited: boolean = false;

  constructor(private store: Store<AppState>,
              private actions$: Actions,
              private alertCtrl: AlertController,
              private nav: NavController,
              private userSrv: UserService,
              private countrySrv: CountryService,
              private modalCtrl: ModalController,
              private evernoteSrv: EvernoteService,
              private translate: TranslateService) {
    this.current_user$ = this.userSrv.getCurrentUser();
  }

  ngOnInit() {
    this.sub = this.current_user$.subscribe(user => {
      this.current_user = user;
      this.rate_limited = this.current_user.rate_limit_until * 1000 > new Date().getTime();
    });
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  gotoPayment() {
    this.nav.setRoot(PaymentComponent);
  }

  editAddress() {
    let modal = this.modalCtrl.create(AddressChangeComponent, {obj: this.current_user});
    modal.onDidDismiss(data => {
      if (data != null) {
        this.store.dispatch({
          type: UserActions.CHANGED,
          payload: Object.assign({}, {_id: this.current_user._id}, data)
        })
      }
    })
    modal.present();
  }

  validateEvernote() {
    this.evernoteSrv.validate();
  }
}
