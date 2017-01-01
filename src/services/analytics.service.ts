import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { Store } from '@ngrx/store';
import { AppState } from "../app/appstate";

import { CONFIG } from '../app/config'
import { UserService } from "./user.service";

declare var ga:Function;

@Injectable()
export class AnalyticsService {
  constructor(private store: Store<AppState>, platform: Platform, private userSrv: UserService) {

    window["dataLayer"].push({
      env: CONFIG.version.indexOf("-") === -1 ? "live" : "development",
      version: CONFIG.version
    });

    userSrv.getCurrentUser().subscribe(user => {
      if (user == null) {
        window["dataLayer"].push({
          user_id: null,
          profile_id: null,
          consultant_id: null,
          business_id: null,
        })
      } else {
        window["dataLayer"].push({
          user_id: user.user_id,
          profile_id: user.profile_id,
          consultant_id: user.consultant_id,
          business_id: user.business_id,
        })
      }
    });
  }


}
