import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import { UserService } from "../services/user.service";
import { USER_RESOURCES, GLOBAL_RESOURCES } from "./resources.list";
import { CONFIG } from "../app/config";
import { Store } from "@ngrx/store";
import { Actions } from "@ngrx/effects";
import { AppState } from "../app/appstate";

@Injectable()
export class ResourcesService {
  constructor(private http: Http,
              private userSrv: UserService,
              private store: Store<AppState>,
              private actions$: Actions) {
    this.initSyncObserver();
    this.refreshGlobalResources();
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
      .ofType("START_USER_SYNC")
      .withLatestFrom(
        this.userSrv.getCurrentUser()
          .map(data => data
            ? Object({user_id: data.user_id, business_id: data.business_id})
            : Object({user_id: null, business_id: null})),
        this.store.select("current_user").map(data => data["business"])
      ).subscribe(([action, user_data, business]) => {
      let obj_id = business ? user_data["business_id"] : user_data["user_id"];
      this.startSync(obj_id, business);
    });
  }

  startSync(obj_id, business) {
    let entity_str = business ? "business" : "user";
    for (let type_name in USER_RESOURCES) {
      let type_obj = USER_RESOURCES[type_name];
      let url = `${CONFIG.filterize.api_url}/${entity_str}/${obj_id}${type_obj.path}`;
      console.log(url)
    }
  }
}
