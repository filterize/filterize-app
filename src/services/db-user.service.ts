import { Injectable } from "@angular/core";
import * as PouchDB from 'pouchdb';
import { Store } from "@ngrx/store";
import { Actions } from "@ngrx/effects";
import { AppState } from "../app/appstate";
import { Platform } from "ionic-angular";
import { Observable } from "rxjs";
import { SearchDocsResult } from "./pouchdb.types";
import * as UserActions from "../user/user.actions";
import { CONFIG } from "../app/config";

@Injectable()
export class DbUserService {
  private dbPool = Object();
  private db = null;
  private p_id: string = null;
  private business: boolean = null;

  constructor(private store: Store<AppState>, private actions$: Actions) {
    this.init_user_switch_db_load();

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
      .filter(obj => obj["_id"] !== this.p_id ||  obj["business"] !== this.business)
      .subscribe(current_user => {
        this.p_id = current_user["_id"];
        this.business = current_user["business"];

        this.store.dispatch({type: UserActions.CLEAR_DATA});
        if (current_user["profile"]) {

          // generate DB label
          let label = current_user["profile"];
          if (current_user["business"]) {
            label = label + "_business";
          }

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

            this.db.changes({
              live: true,
              since: 'now',
              include_docs: true
            }).on('change', change => this.handle_object(change.doc));

            this.dbPool[label] = this.db;
          }

          // read Database
          Observable.fromPromise<SearchDocsResult>(this.db.allDocs({include_docs: true}))
            .map(result => result.rows)
            .flatMap(rows => rows)
            .map(row => row.doc)
            .subscribe(
              doc => this.handle_object(doc),
              null,
              () => this.store.dispatch({
                type: "CHECK_TOKEN",
                payload: {
                  type: "START_USER_SYNC"
                }
              }));
        }
      });
  }

  handle_object(obj) {
    console.log("handle-user-content:", obj);
  }
}
