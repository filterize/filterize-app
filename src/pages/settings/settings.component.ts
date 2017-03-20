import { Component } from '@angular/core';
import { Store } from '@ngrx/store'
import { AppState } from "../../app/appstate";
import * as UserActions from "../../user/user.actions";
import * as SettingsActions from "../../settings/settings.actions";
import { Actions } from "@ngrx/effects";
import { AlertController } from "ionic-angular";
import { TranslateService } from "ng2-translate";
import { Observable } from "rxjs";


@Component({
  template: `
    <ion-header>
      <ion-navbar>
        
        <button ion-button icon-only menuToggle>
          <ion-icon name="menu"></ion-icon>
        </button>
    
        <ion-title>
          <ion-icon name="settings"></ion-icon>
          {{ "SETTINGS.TITLE" | translate }}
        </ion-title>
      </ion-navbar>
    </ion-header>
    
    <ion-content>  
      <filterize-tbd feature="settings"></filterize-tbd>
      <ion-list>
        <ion-item>
          <ion-label color="dark">{{ "SETTINGS.LANGUAGE.LABEL" | translate }}</ion-label>
          <ion-select [ngModel]="(settings$|async).language" (ionChange)="update_select('language', $event)">
            <ion-option value="de">DE - {{ "SETTINGS.LANGUAGE.de" | translate }}</ion-option>
            <ion-option value="en">EN - {{ "SETTINGS.LANGUAGE.en" | translate }}</ion-option>
          </ion-select>
        </ion-item>
      </ion-list>
    </ion-content>
  `
})
export class SettingsComponent {
  settings$: Observable<any>;

  constructor(private store: Store<AppState>,
              private actions$: Actions,
              private alertCtrl: AlertController,
              private translate: TranslateService) {
    this.settings$ = this.store.select("settings");
  }

  update_select(parameter: string, value:any) {
    let payload = Object();
    payload[parameter] = value;
    this.store.dispatch({
      type: SettingsActions.UPDATE,
      payload: payload
    })
  }

}
