import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store'
import { AppState } from "../../app/appstate";
import * as UserActions from "../../user/user.actions";
import { Actions } from "@ngrx/effects";
import { AlertController } from "ionic-angular";
import { TranslateService } from "ng2-translate";
import { UserService } from "../../services/user.service";
import { Subscription } from "rxjs";


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
      <ion-segment [(ngModel)]="annually">
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
          <ion-select [ngModel]="currency">
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
              <ion-card-header>{{ "PAYMENT.1" | translate }}</ion-card-header>
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
              <ion-card-header>{{ "PAYMENT.2" | translate }}</ion-card-header>
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


  constructor(private store: Store<AppState>,
              private actions$: Actions,
              private alertCtrl: AlertController,
              private userSrv: UserService,
              private translate: TranslateService) {
  }

  ngOnInit() {
    this.sub = this.userSrv.getCurrentUser()
      .filter(user => user)
      .subscribe(user => {
        this.user = user;
        this.subscription = user["subscription"];
        this.pricing = user["pricing"];
      })
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  doBuy(plan) {
    console.log("buy", plan);
  }

  doSubscribe(plan) {
    console.log("subscribe", plan);
  }

  doSwitch(plan) {
    console.log("switch", plan);
  }

  doUnsubscribe() {
    console.log("unsubscribe");
  }

}
