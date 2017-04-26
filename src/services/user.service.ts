import { Injectable } from "@angular/core";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { AppState } from "../app/appstate";
import { Actions } from "@ngrx/effects";
import { Http } from "@angular/http";
import { jwtHeaderOnlyOptions } from "../user/user.tools";
import { CONFIG } from "../app/config";
import * as UserActions from "../user/user.actions";


@Injectable()
export class UserService {
  currentUser$;
  business$;
  currentServerParams$;

  constructor(private store: Store<AppState>, private actions$: Actions, private http:Http) {

    this.currentUser$ = Observable.combineLatest(
      store.select("userlist"),
      store.select("current_user")
    )
      .map(([userlist, current_user]) =>  (userlist as Object[]).find(user => user["_id"] === current_user["profile"]))
      .distinctUntilChanged();

    this.business$ = store
      .select("current_user")
      .map(data => data["business"])
      .distinctUntilChanged();

    this.currentServerParams$ = Observable
      .combineLatest(
        store.select("current_user"),
        this.currentUser$.filter(x => x != null)
      )
      .map(x => {console.log("p1", x); return x})
      .map(([params, user]) => {
        console.log("current_params", user, params)
        return Object({
          user_id: user["user_id"],
          business_id: user["business_id"],
          obj_type: params["business"] ? "business" : "user",
          obj_id: params["business"] ? user["business_id"] : user["user_id"],
          access_token: user["access_token"]
        })
      });


    this.actions$
      .ofType("CHECK_TOKEN")
      .withLatestFrom(
        this.currentUser$,
        this.store.select("settings").map(settings => settings["time_offset"])
      )
      .subscribe(([action, user, time]) => this.checkToken(action, user, time));
  }

  private checkToken(action, user, time_offset) {
    // convert to client time, subtract 5 minutes, convert to milliseconds
    if (user == null) {
      return;
    }
    let valid_until = (user["exp"] - time_offset - 300) * 1000;
    if (valid_until > new Date().getTime()) {
      if (action.payload) {
        this.store.dispatch({
          type: action.payload.type,
          payload: Object.assign({}, action.payload.payload, {access_token: user.access_token})
        })
      }
    } else {
      this.http.post(
        `${CONFIG.filterize.oauth_url}/token`,
        {
          grant_type: "refresh_token",
          refresh_token: user["refresh_token"],
        }
      ).map(data => data.json()).subscribe(data => {
        this.store.dispatch({
          type: UserActions.REFRESH_TOKEN,
          payload: data
        });
        if (action.payload) {
          this.store.dispatch({
            type: action.payload.type,
            payload: Object.assign({}, action.payload.payload, {access_token: data.access_token})
          })
        }
      });
    }
  }

  public getCurrentUser() {
    return this.currentUser$;
  }

  public isBusiness() {
    return this.business$;
  }

  public getCurrentServerParams() {
    return this.currentServerParams$;
  }
}
