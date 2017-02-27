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
    <ion-card>
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
            <span *ngIf="current_user?.next_capture">
              {{ "PAYMENT.NEXT_CAPTURE" | translate}}:
              {{ current_user.next_capture | filterize_date: "date"}}
            </span>
            <span *ngIf="!(current_user?.next_capture)">
              {{ "PAYMENT.VALID_UNTIL" | translate}}:
              {{ current_user.valid_until | filterize_date: "date"}}
            </span>
          </span>
        </button>
      </ion-list>
    </ion-card>
     
    <ion-card>
      <ion-card-header>Evernote</ion-card-header>
      <ion-card-content>
        <filterize-tbd feature="dashboard"></filterize-tbd>
        
        <button (click)="validateEvernote()">validate</button>
      </ion-card-content>
    </ion-card>
     
    </ion-content>
  `
})
export class DashboardComponent {
  current_user$: Observable<any>;
  current_user: any;
  sub: Subscription = null;

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
