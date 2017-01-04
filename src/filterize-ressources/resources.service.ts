import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import { UserService } from "../services/user.service";
import { USER_RESOURCES, GLOBAL_RESOURCES } from "./resources.list";
import { CONFIG } from "../app/config";
import { Store } from "@ngrx/store";
import { Actions } from "@ngrx/effects";
import { AppState } from "../app/appstate";
import * as UserActions from "../user/user.actions";
import { jwtHeaderOnlyOptions } from "../user/user.tools";

@Injectable()
export class ResourcesService {
  private last_changed = Object()

  constructor(private http: Http,
              private userSrv: UserService,
              private store: Store<AppState>,
              private actions$: Actions) {
    this.initSyncObserver();
    this.refreshGlobalResources();
    this.init_last_changed();
  }

  refreshGlobalResources() {
    this.actions$.ofType("LOAD_GLOBALS").first().subscribe(() => {
      for (let res of GLOBAL_RESOURCES) {
        this.http.get(`${CONFIG.filterize.api_url}${res.path}`)
          .map(data => data.json())
          .subscribe(data => this.store.dispatch({
            type: `${res.action_prefix}_FROM_SERVER`,
            payload: data
          }));
      }
    });
  }

  initSyncObserver() {
    this.actions$
      .ofType(UserActions.START_SYNC)
      .withLatestFrom(
        this.userSrv.getCurrentUser()
          .map(data => data
            ? Object({user_id: data.user_id, business_id: data.business_id, access_token: data.access_token})
            : Object({user_id: null, business_id: null})),
        this.store.select("current_user").map(data => data["business"])
      ).subscribe(([action, user_data, business]) => {
      let obj_id = business ? user_data["business_id"] : user_data["user_id"];
      let access_token = (action.payload) ? action.payload.access_token : user_data["access_token"];
      this.startSync(obj_id, access_token, business);
    });
  }

  startSync(obj_id, access_token, business) {
    let entity_str = business ? "business" : "user";
    for (let type_name in USER_RESOURCES) {
      let type_obj = USER_RESOURCES[type_name];
      let since = this.get_last_changed(type_name);
      let url = `${CONFIG.filterize.api_url}/${entity_str}/${obj_id}${type_obj.path}?since=${since}`;
      console.log(url);
      this.http.get(url, jwtHeaderOnlyOptions(access_token))
        .map(data => data.json())
        .withLatestFrom(this.userSrv.currentUser$, this.store.select("current_user"))
        .filter(([data, user, current]) => data.user.id == user["user_id"] && data.user.business == current["business"])
        .map(([data, user, current]) => data["data"])
        .filter(data => data.length > 0)
        .subscribe(obj => {
          this.store.dispatch({
            type: `${type_obj.action_prefix}_BULK_FROM_SERVER`,
            payload: obj
          })
        })
    }
  }

  init_last_changed() {
    for (let key in USER_RESOURCES) {
      let res = USER_RESOURCES[key];
      this.store.select(res.store)
        .map((data:any[]) => data.map((obj) => obj["#changed"]))
        .map(data => Math.max(...data, 0))
        .map(data => isNaN(data) ? 0 : data)
        .subscribe(data => this.last_changed[key] = data);
    }
  }

  get_last_changed(type) {
    if (type in this.last_changed) {
      return this.last_changed[type];
    }
    return 0;
  }
}
