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
  private dbPool = Object()
  private db = null;

  constructor(private store: Store<AppState>) {
    this.store.select("current_user").subscribe(current_user => {
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
          .subscribe(doc => this.handle_object(doc));
      }
    });

    /*
    store.select("userlist")
      .flatMap((userList: Object[]) => Observable.from(userList))
      .filter(obj => "#dirty-db" in obj)
      .subscribe(user => this.update_user(user));
     */
  }

  handle_object(obj) {
    console.log("handle-user-content:", obj);
  }
}
