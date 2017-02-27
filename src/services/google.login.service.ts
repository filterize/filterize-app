import { Injectable } from "@angular/core";
import { GooglePlus } from "ionic-native";
import {GO2} from "./google-oauth2";
import { Store } from "@ngrx/store";
import { AppState } from "../app/appstate";
import * as UserActions from "../user/user.actions";

let webClientId = "812732464823-29qo9pdpk3v4d7f2nmhk4q2htor12223.apps.googleusercontent.com";
let redirectUri = "google.html";

@Injectable()
export class GoogleLoginService {
  constructor (private store:Store<AppState>) {}

  login() {
    GooglePlus.login({
      webClientId: webClientId
    })
      .then(res => console.log("Login-Result", res))
      .catch(err => {
        console.error("Login-Error", err);
        this.loginWeb();
      });

  }

  loginWeb() {
    let go2 = new GO2({
      clientId: webClientId,
      redirectUriSuffix: redirectUri,
      scope: ["email", "profile", "openid"]
    });

    go2.onlogin = (token) => this.store.dispatch({
      type: UserActions.GOOGLE_LOGIN,
      payload: token
    });

    go2.login();
  }

  logout() {}
}
