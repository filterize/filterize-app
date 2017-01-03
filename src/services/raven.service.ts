import { Injectable } from "@angular/core";
import { Actions } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { AppState } from "../app/appstate";
import * as Raven from 'raven-js';
import { CONFIG } from "../app/config";
import { UserService } from "./user.service";

@Injectable()
export class RavenService {
  constructor(private actions$: Actions,
              private store: Store<AppState>,
              private userSrv: UserService) {
    // this.setTags();

    userSrv.getCurrentUser().subscribe(user => {
      if (user == null) {
        Raven.setUserContext({})
      } else {
        Raven.setUserContext({
          id: user._id,
          username: user.username,
          email: user.email
        })
      }
    })

  }

  setTags() {
    Raven.setTagsContext({

    });
  }
}
