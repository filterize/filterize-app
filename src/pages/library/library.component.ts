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
        
        <button ion-button icon-only menuToggle>
          <ion-icon name="menu"></ion-icon>
        </button>
    
        <ion-title>
          <ion-icon name="map"></ion-icon>
          {{ "LIBRARY.TITLE" | translate }}
        </ion-title>
      </ion-navbar>
    </ion-header>
    
    <ion-content padding>  
     <filterize-tbd feature="library"></filterize-tbd>
    </ion-content>
  `
})
export class LibraryComponent {
  constructor(private store: Store<AppState>,
              private actions$: Actions,
              private alertCtrl: AlertController,
              private translate: TranslateService) {
  }

}
