import { Injectable } from "@angular/core";
import { Http, Headers } from "@angular/http";
import { Actions, Effect } from "@ngrx/effects";
import * as UserActions from "./user.actions";
import { CONFIG } from "../app/config"
import { Observable } from "rxjs";
import { jwtHeaderOnlyOptions } from "./user.tools";
import { USER_RESOURCES } from "../filterize-ressources/resources.list";

@Injectable()
export class UserEffects {
  constructor(private http: Http, private actions$: Actions) {
  }

  @Effect() login$ = this.actions$
  // Listen for Login
    .ofType(UserActions.LOGIN)
    .switchMap(action => this.http.post(
      `${CONFIG.filterize.oauth_url}/token`,
      {
        grant_type: "password",
        username: action.payload.email,
        password: action.payload.password,
        client_id: CONFIG.filterize.client_id
      }))
    .map(res => ({type: UserActions.LOGIN_SUCCESS, payload: res.json()}))
    .catch(res => Observable.of({type: UserActions.LOGIN_FAILED, payload: res.json()}));

  @Effect() basicData$ = this.actions$
  // Listen for Login
    .ofType(UserActions.LOGIN_SUCCESS)
    .switchMap(action => this.http.get(
      `${CONFIG.filterize.api_url}/user`,
      jwtHeaderOnlyOptions(action.payload.access_token),
      ))
    .map(res => ({type: UserActions.BASIC_DETAILS_FROM_SERVER, payload: res.json()}));

  /*
  @Effect() syncAfterLogin = this.actions$
    .ofType(UserActions.LOGIN_SUCCESS)
    .map(() => ({type: UserActions.START_SYNC}));
  */

  /*
  @Effect() syncUserResources = this.actions$
    .ofType(UserActions.START_SYNC)
    .switchMap(() => {
      let events = [];
      for (let key in USER_RESOURCES) {
        events.push({type: `${USER_RESOURCES[key]["action_prefix"]}_START_SYNC`})
      }
      return Observable.from(events);
    });
    */

  @Effect() signup$ = this.actions$
    .ofType(UserActions.SIGN_UP)
    .switchMap(action => this.http.post(
      `${CONFIG.filterize.api_url}/user/create`,
      {
        client_id: CONFIG.filterize.client_id,
        email: action.payload.email,
        password: action.payload.password,
        firstname: action.payload.first_name,
        lastname: action.payload.last_name
      })
      .map(res => action)
    )
    .map(action => ({
      type: UserActions.LOGIN,
      payload: {
        email: action.payload.email,
        password: action.payload.password
      }
    }))
    .catch(res => Observable.of({type: UserActions.SIGN_UP_FAILED, payload: res.status}));

}
