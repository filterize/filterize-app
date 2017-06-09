import { Injectable } from "@angular/core";
import * as PouchDB from 'pouchdb';
import { Store } from "@ngrx/store";
import { Actions } from "@ngrx/effects";
import { AppState } from "../app/appstate";
import { Platform, LoadingController, Loading } from "ionic-angular";
import { Observable } from "rxjs";
import { SearchDocsResult } from "./pouchdb.types";
import * as UserActions from "../user/user.actions";
import { CONFIG } from "../app/config";
import { USER_RESOURCES } from "../filterize-ressources/resources.list";
import { filter } from "rxjs/operator/filter";
import { TranslateService } from "ng2-translate";

@Injectable()
export class DbUserService {
  private dbPool = Object();
  private db = null;
  private p_id: string = null;
  private business: boolean = null;
  private seq = 0;
  private observables: any[] = [];

  constructor(private store: Store<AppState>,
              private actions$: Actions,
              private loadingCtrl: LoadingController,
              private trans: TranslateService
  ) {
    this.init_user_switch_db_load();
    this.init_store_listener();
    this.initLogoutListener();

    /*
    store.select("userlist")
      .flatMap((userList: Object[]) => Observable.from(userList))
      .filter(obj => "#dirty-db" in obj)
      .subscribe(user => this.update_user(user));
     */
  }

  init_user_switch_db_load() {
    this.store
      .select("current_user")
      .filter(obj => ("profile" in obj && "business" in obj))
      .filter(obj => obj["profile"] !== this.p_id ||  obj["business"] !== this.business)
      .subscribe(current_user => {
        let loading = this.loadingCtrl.create();
        this.trans.get("UI.LOADING").subscribe(content => {
          loading.setContent(content);
        });
        loading.present();
        this.p_id = current_user["profile"];
        this.business = current_user["business"];

        this.store.dispatch({type: UserActions.CLEAR_DATA});
        if (current_user["profile"]) {

          // generate DB label
          let label = current_user["profile"];
          if (current_user["business"]) {
            label = label + "_business";
          }
          console.log("open_db", label);
          // Load Database
          if (label in this.dbPool) {
            this.db = this.dbPool[label];
          } else {
            this.db = new PouchDB(
              label,
              {
                // adapter: "websql",
                auto_compaction: true
              });

            this.dbPool[label] = this.db;
          }
          console.log("db-instance", this.db);

          this.seq = 0;
          this.fetch_changes(() => {
            this.store.dispatch({
              type: "CHECK_TOKEN",
              payload: {
                type: "START_USER_SYNC"
              }
            });
            loading.dismiss();
          });
        } else {
          loading.dismiss();
        }
      });
  }

  init_store_listener() {
    for (let key in USER_RESOURCES) {
      let res = USER_RESOURCES[key];
      this.observables.push(
        this.store.select(res.store)
          .map((collection: any[]) => collection.filter((obj) => "#dirty-db" in obj))
          .map(collection => collection.map(obj => {delete obj["#dirty-db"]; return obj}))
          .filter(collection => collection.length > 0)
          .subscribe(data => {
            console.log("store", this, data);
            if (this.db) {
              this.db.bulkDocs(data).then(this.fetch_changes(null, key))
            }
          })
      );
    }
  }

  fetch_changes(finished=null, type_only=null) {
    this.db.changes({
      since: this.seq,
      include_docs: true,
      timeout: 1000
    }).then(changes => {
      let object_collection = Object();
      this.seq = changes.last_seq;
      for (let res of changes.results) {
        let type = res.id.split("_")[0];
        if (type_only && type != type_only) continue;
        if (object_collection[type] == null) {
          object_collection[type] = [];
        }
        object_collection[type].push(res.doc);
      }
      console.log("user-db-loaded:", object_collection, type_only);
      for (let key in object_collection) {
        if (key in USER_RESOURCES) {
          this.store.dispatch({
            type: `${USER_RESOURCES[key].action_prefix}_BULK_FROM_DATABASE`,
            payload: object_collection[key]
          })
        }
      }

    }).catch(err => console.log("ERROR", err)).then(finished);
  }

  initLogoutListener() {
    this.actions$.ofType(UserActions.LOGOUT)
      .subscribe(action => {
        for (let name of [action.payload, `${action.payload}_business`]) {
          delete this.dbPool[name];
          new PouchDB(name).destroy();
        }
      })
  }

  handle_object(obj) {
    console.log("handle-user-content:", obj);
  }
}
