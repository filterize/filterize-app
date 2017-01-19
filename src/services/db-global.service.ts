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
import { GLOBAL_RESOURCES } from "../filterize-ressources/resources.list";

@Injectable()
export class DbGlobalService {
  private db;

  constructor(private store: Store<AppState>, private actions$: Actions) {
    /*
    if (!CONFIG.production) {
      window["PouchDB"] = PouchDB;
    }
    */

    this.db = new PouchDB(
      "global",
      {
        // adapter: "websql",
        auto_compaction: true
      });

    this.db.info().then(out => console.log("db-info",out));

    actions$.ofType(UserActions.LOGOUT)
      .map(action => action.payload)
      .subscribe(p_id => this.db.get(p_id).then((obj => this.db.put({_id: obj._id, _rev: obj._rev}))));

    store.select("userlist")
      .flatMap((userList: Object[]) => Observable.from(userList))
      .filter(obj => "#dirty-db" in obj)
      .subscribe(user => this.store_obj(user));

    store.select("current_user")
      .filter(obj => "#dirty-db" in obj)
      .subscribe(conf => this.store_obj(conf));

    store.select("settings")
      .filter(obj => "#dirty-db" in obj)
      .subscribe(conf => this.store_obj(conf));

    store.select("globals")
      .switchMap(globals => {
        let objects = [];
        for (let key in globals) {
          objects.push(globals[key])
        }
        return Observable.from(objects)
      })
      .filter(obj => "#dirty-db" in obj)
      .subscribe(conf => this.store_obj(conf));

    Observable.fromPromise<SearchDocsResult>(this.db.allDocs({include_docs: true}))
      .map(result => result.rows)
      .flatMap(rows => rows)
      .map(row => row.doc)
      .subscribe(doc => this.handle_object(doc),
        null,
        () => {
        this.store.dispatch({type: "LOAD_GLOBALS"});
      });

    this.db.changes({
      live: true,
      since: 'now',
      include_docs: true
    }).on('change', change => this.handle_object(change.doc));
  }

  handle_object(obj) {
    let types = [
      "user", "current_user", "settings"
    ];
    for (let t of types) {
      if (obj._id.startsWith(t)) {
        if (t == "user" && !("access_token" in obj)) {
          continue;
        }
        t = t.toUpperCase();
        this.store.dispatch({
          type: `${t}_FROM_DATABASE`,
          payload: obj
        });
        return;
      }
    }
    for (let res of GLOBAL_RESOURCES) {
      if (obj._id = res.name) {
        this.store.dispatch({
          type: `${res.action_prefix}_FROM_DATABASE`,
          payload: obj
        });
        return;
      }
    }
  }

  store_obj(obj) {
    obj = Object.assign({}, obj);
    if ("#dirty-db" in obj) {
      delete obj["#dirty-db"];
      this.db.put(obj).catch(err => {
        this.db.get(obj._id).then(stored => {
          delete obj._id;
          delete obj._rev;
          Object.assign(stored, obj);
          this.db.put(stored);
        })
      });
    }
  }
}
