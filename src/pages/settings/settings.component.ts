import { Component, OnInit } from '@angular/core';
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
      <ion-list>
        <ion-item>
          <ion-label color="dark">{{ "SETTINGS.LANGUAGE.LABEL" | translate }}</ion-label>
          <ion-select [ngModel]="(settings$|async).language" (ionChange)="update_select('language', $event)">
            <ion-option value="de">DE - {{ "SETTINGS.LANGUAGE.de" | translate }}</ion-option>
            <ion-option value="en">EN - {{ "SETTINGS.LANGUAGE.en" | translate }}</ion-option>
          </ion-select>
        </ion-item>
        
        <ion-item>
          <ion-label color="dark">
            {{ "SETTINGS.DATE_FORMAT" | translate }}
          </ion-label>
          <ion-select [ngModel]="(settings$|async).date_format" (ionChange)="update_select('date_format', $event)">
            <ion-option 
              *ngFor="let format_code of DATE_FORMATS"
              [value]="format_code"
            >{{ date | filterize_date:format_code }}</ion-option>
          </ion-select>
        </ion-item>
        
        <ion-item>
          <ion-label color="dark">
            {{ "SETTINGS.TIME_FORMAT" | translate }}
          </ion-label>
          <ion-select [ngModel]="(settings$|async).time_format" (ionChange)="update_select('time_format', $event)">
            <ion-option 
              *ngFor="let format_code of TIME_FORMATS"
              [value]="format_code"
            >{{ date | filterize_date:format_code }}</ion-option>
          </ion-select>
        </ion-item>
      </ion-list>
    </ion-content>
  `
})
export class SettingsComponent implements OnInit {
  DATE_FORMATS = [
    '%a %d %b %Y',
    '%a %d %b %y',
    '%Y-%m-%d',
    '%y-%m-%d',
    '%d.%m.%Y',
    '%d.%m.%y',
    '%d/%m/%Y',
    '%d/%m/%y',
    '%m/%d/%Y',
    '%m/%d/%y'
  ];

  TIME_FORMATS = [
    '%H:%M',
    '%H:%M:%S',
    '%I:%M %p',
    '%I:%M:%S %p'
  ];

  settings$: Observable<any>;
  date: Date;


  constructor(private store: Store<AppState>,
              private actions$: Actions,
              private alertCtrl: AlertController,
              private translate: TranslateService) {
    this.settings$ = this.store.select("settings");
  }

  ngOnInit(): void {
    this.date = new Date();
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
