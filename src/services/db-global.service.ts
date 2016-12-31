import { Injectable } from "@angular/core";
import * as PouchDB from 'pouchdb';
import { Store } from "@ngrx/store";
import { Actions } from "@ngrx/effects";
import { AppState } from "../app/appstate";
import { Platform } from "ionic-angular";
import { Observable } from "rxjs";
import { SearchDocsResult } from "./pouchdb.types";
import * as UserActions from "../user/user.actions";

@Injectable()
export class DbGlobalService {
  private db;

  constructor(private store: Store<AppState>) {
    console.log("DB Init");

    this.db = new PouchDB(
      "global",
      {
        // adapter: "websql",
        auto_compaction: true
      });

    store.select("userlist")
      .flatMap((userList: Object[]) => Observable.from(userList))
      .filter(obj => "#dirty-db" in obj)
      .subscribe(user => this.update_user(user));

    Observable.fromPromise<SearchDocsResult>(this.db.allDocs({include_docs: true}))
      .map(result => result.rows)
      .flatMap(rows => rows)
      .map(row => row.doc)
      .subscribe(doc => this.handle_object(doc));

    this.db.changes({
      live: true,
      since: 'now',
      include_docs: true
    }).on('change', change => this.handle_object(change.doc));
  }

  handle_object(obj) {
    console.log("handle:", obj);
    if (obj._id.startsWith("user")) {
      this.store.dispatch({
        type: UserActions.FROM_DATABASE,
        payload: obj
      })
    }
  }

  update_user(user) {
    console.log(user);
    let obj = Object.assign({}, user);
    if ("#dirty-db" in obj) {
      delete obj["#dirty-db"];
      this.db.put(obj);
      console.log("store")
    }
    else {
      console.log("discard")
    }
  }
}
