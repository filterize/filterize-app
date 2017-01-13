import { Component } from '@angular/core';
import { Store } from '@ngrx/store'
import { AppState } from "../../app/appstate";
import { LoginComponent } from "./login.component";
import { SignupComponent } from "./signup.component";
import { TranslateService } from "ng2-translate";
import { UserSelectComponent } from "../../user/user-select.component";
import { Observable, Subscription } from "rxjs";



@Component({
  selector: "filterize-login-signup",
  template: `
    <ion-tabs>
      <ion-tab tabIcon="person-add" [tabTitle]="signupLabel" [root]="signupTab"></ion-tab>
      <ion-tab tabIcon="person" [tabTitle]="loginLabel" [root]="loginTab"></ion-tab>
      <ion-tab *ngIf="userAvailable$ | async" tabIcon="people" [tabTitle]="selectLabel" [root]="selectTab"></ion-tab>
    </ion-tabs>
  `
})
export class LoginSignupComponent {
  userAvailable$: Observable<boolean>;

  selectLabel = "USER.SELECT";
  selectTab = UserSelectComponent;

  signupLabel = "LOGIN.SIGN_UP";
  signupTab = SignupComponent;

  loginLabel = "LOGIN.LOGIN";
  loginTab = LoginComponent;

  private can_leave = false;
  private sub: Subscription;

  constructor(private store: Store<AppState>, translate: TranslateService) {
    translate.get(["LOGIN.LOGIN", "LOGIN.SIGN_UP", "USER.SELECT"]).subscribe(data => {
        this.signupLabel = data["LOGIN.SIGN_UP"];
        this.loginLabel = data["LOGIN.LOGIN"];
        this.selectLabel = data["USER.SELECT"];
      }
    );

    this.userAvailable$ = store.select("userlist").map((list: any[]) => list.length > 0);
  }

  ngOnInit() {
    this.sub = this.store.select("current_user")
      .subscribe(data => this.can_leave = data["profile"] != "");
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  ionViewCanLeave() {
    if (!this.can_leave) {
      console.log("can't leave");
    }
    return this.can_leave;
  }
}
