import { Component } from '@angular/core';
import { Store } from '@ngrx/store'
import { AppState } from "../../app/appstate";
import * as UserActions from "../../user/user.actions";
import { Actions } from "@ngrx/effects";
import { AlertController } from "ionic-angular";
import { TranslateService } from "ng2-translate";


@Component({
  template: `
    <ion-header>
      <ion-navbar>
        
        <ion-title>
          <ion-icon name="funnel"></ion-icon>
          {{ "FILTER.TITLE" | translate }}
        </ion-title>
      </ion-navbar>
    </ion-header>
    
    <ion-content padding>  
     <filterize-tbd feature="filter"></filterize-tbd>
    </ion-content>
  `
})
export class FilterComponent {
  constructor(private store: Store<AppState>,
              private actions$: Actions,
              private alertCtrl: AlertController,
              private translate: TranslateService) {
  }

}
