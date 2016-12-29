import { Component } from '@angular/core';
import { Store } from '@ngrx/store'
import { AppState } from "../../app/appstate";
import { TranslateService } from "ng2-translate";
import { AlertController } from "ionic-angular";
import { Actions } from "@ngrx/effects";
import * as UserActions from "../../user/user.actions";


@Component({
  template: `
    <ion-header>
      <ion-navbar>
        
        <ion-title>
          <ion-icon name="person-add"></ion-icon>
          {{ "LOGIN.SIGN_UP" | translate }}
        </ion-title>
      </ion-navbar>
    </ion-header>
    
    <ion-content padding>    
      <ion-list>
        <ion-item>
          <ion-label floating>{{ "USER.FIRST_NAME" | translate }}</ion-label>
          <ion-input type="text" [(ngModel)]="first_name"></ion-input>
        </ion-item>
      
        <ion-item>
          <ion-label floating>{{ "USER.LAST_NAME" | translate }}</ion-label>
          <ion-input type="text" [(ngModel)]="last_name"></ion-input>
        </ion-item>
      
        <ion-item>
          <ion-label floating>{{ "USER.E_MAIL" | translate }}</ion-label>
          <ion-input type="text" [(ngModel)]="email"></ion-input>
        </ion-item>
      
        <ion-item>
          <ion-label floating>{{ "USER.PASSWORD" | translate }}</ion-label>
          <ion-input type="password" [(ngModel)]="password"></ion-input>
        </ion-item>
      </ion-list>
      
      <button ion-button block (click)="onSignup()" [disabled]="in_progress">{{ "LOGIN.SIGN_UP" | translate }}</button>
    </ion-content>
    
    
  `
})
export class SignupComponent {
  email = "";
  password = "";
  first_name = "";
  last_name = "";
  in_progress = false;

  constructor(private store: Store<AppState>,
              private actions$: Actions,
              private alertCtrl: AlertController,
              private translate: TranslateService) { }

  onSignup() {
    this.in_progress = true;

    this.actions$.ofType(UserActions.SIGN_UP_FAILED).first().subscribe(action => {
      this.onSignupFailed(action.payload);
    });

    this.store.dispatch({
      type: UserActions.SIGN_UP,
      payload: {
        email: this.email,
        password: this.password,
        first_name: this.first_name,
        last_name: this.last_name
      }
    })
  }

  onSignupFailed(status) {
    this.in_progress = false;
    this.translate.get(["UI.OK", "UI.ERROR", `LOGIN.SIGN_UP_ERROR_${status}`]).first().subscribe(data => {
      let alert = this.alertCtrl.create({
        title: data["UI.ERROR"],
        subTitle: data[`LOGIN.SIGN_UP_ERROR_${status}`],
        buttons: [data["UI.OK"]]
      });
      alert.present();
    })
  }
}
