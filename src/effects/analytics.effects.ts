import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';

@Injectable()
export class AnalyticsEffects {
  constructor(private updates: Actions) {
    updates.subscribe(data => {
      console.log("AnalyticsEffects:", data)
    })
  }

}
