import { Component } from '@angular/core';
import { Store } from '@ngrx/store'
import { AppState } from "../../app/appstate";
import { LoginComponent } from "./login.component";
import { SignupComponent } from "./signup.component";
import { TranslateService } from "ng2-translate";



@Component({
  selector: "filterize-login-signup",
  template: `
    <ion-tabs>
      <ion-tab tabIcon="person-add" [tabTitle]="signupLabel" [root]="signupTab"></ion-tab>
      <ion-tab tabIcon="person" [tabTitle]="loginLabel" [root]="loginTab"></ion-tab>
    </ion-tabs>
  `
})
export class LoginSignupComponent {
  signupLabel = "LOGIN.SIGN_UP";
  signupTab = SignupComponent;

  loginLabel = "LOGIN.LOGIN";
  loginTab = LoginComponent;

  private can_leave = false;

  constructor(private store: Store<AppState>, translate: TranslateService) {
    translate.get(["LOGIN.LOGIN", "LOGIN.SIGN_UP"]).subscribe(data => {
        this.signupLabel = data["LOGIN.SIGN_UP"];
        this.loginLabel = data["LOGIN.LOGIN"];
      }
    );

    store.select("current_user")
      .subscribe(data => this.can_leave = data["profile"] != "");
  }

  ionViewCanLeave() {
    return this.can_leave;
  }
}
