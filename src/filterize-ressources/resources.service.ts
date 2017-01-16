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
import { Observable } from "rxjs";
import { Notebook } from "../notebook/notebook.spec";
import { notebookIgnoreDeleted, notebookSort } from "../notebook/notebook.tools";

@Injectable()
export class ResourcesService {
  private last_changed = Object();
  private openSync$: Observable<number>;
  private notebooks$: Observable<Notebook[]>;

  constructor(private http: Http,
              private userSrv: UserService,
              private store: Store<AppState>,
              private actions$: Actions) {
    this.initSyncObserver();
    this.refreshGlobalResources();
    this.init_last_changed();
    this.initOpenSyncCount();

    this.notebooks$ = store.select(USER_RESOURCES.notebook.store)
      .map(notebookIgnoreDeleted)
      .map(notebookSort)
  }

  getOpenSyncCount () {
    return this.openSync$;
  }

  initOpenSyncCount() {
    let obs: Observable<number>[] = [];
    for (let key in USER_RESOURCES) {
      let type = USER_RESOURCES[key];
      obs.push(
        this.store
          .select(type.store)
          .map((data: Object[]) => data.filter(obj => obj["#dirty-server"] || obj["#dirty-server-sync"]).length)
          .distinctUntilChanged()
      );
    }
    obs.push(this.userSrv.getCurrentUser().map(obj => obj != null && (obj["#dirty-server"] || obj["#dirty-server-sync"])
      ? 1 : 0));
    this.openSync$ = Observable
      .combineLatest(...obs)
      .map(elems => elems.reduce((a, b) => a+b, 0));
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
            ? data
            : Object({user_id: null, business_id: null})),
        this.store.select("current_user").map(data => data["business"])
      )
      .subscribe(([action, user_data, business]) => {
        let obj_id = business ? user_data["business_id"] : user_data["user_id"];
        let access_token = (action.payload) ? action.payload.access_token : user_data["access_token"];
        this.startSync(obj_id, access_token, business);

        if (user_data["user_id"]) {
          this.http.put(
            `${CONFIG.filterize.api_url}/user/${user_data["user_id"]}`,
            {
              data: user_data["#dirty-server-sync"] ? user_data : null,
              state: user_data["profile_id"]
            },
            jwtHeaderOnlyOptions(access_token),
          )
            .map(data => data.json())
            .map(data => Object.assign({}, data["data"], {"profile_id": data["state"]}))
            .subscribe(res => {
              this.store.dispatch({type: UserActions.DETAILS_FROM_SERVER, payload: res})
            });
        }
      });


    for (let type_name in USER_RESOURCES) {
      let type_obj = USER_RESOURCES[type_name];
      // todo: check for current token
      this.store.select(type_obj.store)
        .flatMap((obj: any[]) => obj)
        .filter(obj => !obj["#dirty-db"] && !obj["#dirty-server-sync"] && obj["#dirty-server"])
        .withLatestFrom(
          this.userSrv.getCurrentServerParams(),
        )
        .subscribe(([obj, params]) => {
          console.log("toSync", obj, params);
          this.http.put(
            `${CONFIG.filterize.api_url}/${params.obj_type}/${params.obj_id}${type_obj.path}/${obj[type_obj.id]}`,
            obj,
            jwtHeaderOnlyOptions(params["access_token"])
          )
            .map(data => data.json().data)
            .map(data => {
              delete data["#hash"];
              delete data["#changed"];
              return data;
            })
            .subscribe(
              (res) => this.store.dispatch({type: `${type_obj.action_prefix}_SINGLE_SYNC_OK`, payload: Object.assign({}, obj, res)}),
              () => this.store.dispatch({type: `${type_obj.action_prefix}_SINGLE_SYNC_FAIL`, payload: obj})
            );
        });
    }

    this.userSrv.getCurrentUser()
      .filter(obj => obj != null)
      .filter(obj => !obj["#dirty-db"] && !obj["#dirty-server-sync"] && obj["#dirty-server"])
      .distinctUntilChanged()
      .subscribe(user_data => {
        if (user_data["user_id"]) {
          this.http.put(
            `${CONFIG.filterize.api_url}/user/${user_data["user_id"]}`,
            {
              data: user_data,
              state: {
                _id: user_data._id,
                _rev: user_data._rev
              }
            },
            jwtHeaderOnlyOptions(user_data["access_token"]),
          )
            .map(data => data.json())
            .map(data => Object.assign({}, data["data"], data["state"]))
            .subscribe(res => {
              this.store.dispatch({type: UserActions.SYNC_SINGLE_OK, payload: res})
            }, (err) => {
              this.store.dispatch({type: UserActions.SYNC_SINGLE_FAILED, payload: {
                _id: user_data._id,
                _rev: user_data._rev,
                error: err
              }})
            });
        }
      });
  }

  startSync(obj_id, access_token, business) {
    let entity_str = business ? "business" : "user";
    for (let type_name in USER_RESOURCES) {
      let type_obj = USER_RESOURCES[type_name];
      this.store
        .select(type_obj.store)
        .first()
        .map((data: Object[]) => data.filter(obj => obj["#dirty-server-sync"]))
        .subscribe(unsynced => {
          let since = this.get_last_changed(type_name);
          let url = `${CONFIG.filterize.api_url}/${entity_str}/${obj_id}${type_obj.path}`;
          console.log(url, unsynced);
          this.http.put(
            url,
            {
              data: unsynced,
              since: since
            },
            jwtHeaderOnlyOptions(access_token)
          )
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
        });
    }
  }

  init_last_changed() {
    for (let key in USER_RESOURCES) {
      let res = USER_RESOURCES[key];
      this.store.select(res.store)
        .map((data: any[]) => data.map((obj) => obj["#changed"]))
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

  getNotebooks() {
    return this.notebooks$;
  }
}
