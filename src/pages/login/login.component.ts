import { Component } from '@angular/core';
import { Store } from '@ngrx/store'
import { AppState } from "../../app/appstate";
import * as UserActions from "../../user/user.actions";
import { Actions } from "@ngrx/effects";
import { AlertController } from "ionic-angular";
import { TranslateService } from "ng2-translate";
import { GoogleLoginService } from "../../services/google.login.service";


@Component({
  template: `
    <ion-header>
      <ion-navbar>
        
        <ion-title>
          <ion-icon name="person"></ion-icon>
          {{ "LOGIN.LOGIN" | translate }}
        </ion-title>
      </ion-navbar>
    </ion-header>
    
    <ion-content padding>  
     <form (ngSubmit)="onLogin()">
     
      <ion-list>
        <ion-item>
          <ion-label floating>{{ "USER.E_MAIL" | translate }}</ion-label>
          <ion-input type="text" [(ngModel)]="email" name="email"></ion-input>
        </ion-item>
      
        <ion-item>
          <ion-label floating>{{ "USER.PASSWORD" | translate }}</ion-label>
          <ion-input type="password" [(ngModel)]="password" name="password"></ion-input>
        </ion-item>
      </ion-list>
      
      <button ion-button block [disabled]="in_progress" (click)="onLogin()">{{ "LOGIN.LOGIN" | translate }}</button>
      </form>
      <br>
      <button ion-button block outline [disabled]="in_progress" (click)="onGoogleLogin()" color="danger">
        <ion-icon name="googleplus"></ion-icon>
        {{ "LOGIN.LOGIN_GOOGLE" | translate }}
      </button>
    </ion-content>
  `
})
export class LoginComponent {
  in_progress = false;
  email = "";
  password = "";

  constructor(private store: Store<AppState>,
              private actions$: Actions,
              private alertCtrl: AlertController,
              private googleLoginSrv: GoogleLoginService,
              private translate: TranslateService) {
  }

  onLogin() {
    this.in_progress = true;

    this.actions$.ofType(UserActions.LOGIN_FAILED).first().subscribe(() => {
      this.onLoginFailed();
    });

    this.store.dispatch({
      type: UserActions.LOGIN,
      payload: {
        email: this.email,
        password: this.password
      }
    })
  }

  onLoginFailed() {
    this.in_progress = false;
    this.translate.get(["UI.OK", "UI.ERROR", "LOGIN.LOGIN_ERROR_MSG"]).first().subscribe(data => {
      let alert = this.alertCtrl.create({
        title: data["UI.ERROR"],
        subTitle: data["LOGIN.LOGIN_ERROR_MSG"],
        buttons: [data["UI.OK"]]
      });
      alert.present();
    })
  }

  onGoogleLogin() {
    this.googleLoginSrv.login();
  }
}
