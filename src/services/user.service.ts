import { Injectable } from "@angular/core";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { AppState } from "../app/appstate";

@Injectable()
export class UserService {
  currentUser$;

  constructor(private store: Store<AppState>) {

    this.currentUser$ = Observable.combineLatest(
      store.select("userlist"),
      store.select("current_user")
    )
      .map(([userlist, current_user]) =>  (userlist as Object[]).find(user => user["_id"] === current_user["profile"]))
      .distinctUntilChanged();
  }

  public getCurrentUser() {
    return this.currentUser$;
  }
}
