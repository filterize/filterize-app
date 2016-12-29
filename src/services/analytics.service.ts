import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { Store } from '@ngrx/store';
import { AppState } from "../app/appstate";

import { CONFIG } from '../app/config'

declare var ga:Function;

@Injectable()
export class AnalyticsService {
  constructor(private store: Store<AppState>, platform: Platform) {
    platform.ready().then(() => {
        this.initAnalytics();
        this.trackPageView();
      }
    );
    store.select("router").forEach(data => console.log(data))
  }

  initAnalytics() {
    // ga("create", CONFIG.analytics.tracking_id, "auto");
  }

  trackPageView() {
    // ga("send", "pageview");
  }

}
