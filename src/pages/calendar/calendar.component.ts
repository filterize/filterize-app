import { Component } from '@angular/core';
import { Store } from '@ngrx/store'
import { AppState } from "../../app/appstate";
import * as UserActions from "../../user/user.actions";
import { Actions } from "@ngrx/effects";
import { AlertController, NavController } from "ionic-angular";
import { TranslateService } from "ng2-translate";
import { Observable } from "rxjs";
import { Notebook } from "../../notebook/notebook.spec";
import { USER_RESOURCES } from "../../filterize-ressources/resources.list";
import { ignoreDeletedFilter } from "../../filterize-ressources/resources.tools";
import { notebookIgnoreDeleted, notebookSort } from "../../notebook/notebook.tools";
import { ResourcesService } from "../../filterize-ressources/resources.service";
import * as CalendarActions from "./calendar.actions"
import { CalendarDetailsComponent } from "./calendar-details.component";


@Component({
  template: `
    <ion-header>
      <ion-navbar>
        
        <button ion-button icon-only menuToggle>
          <ion-icon name="menu"></ion-icon>
        </button>
    
        <ion-title>
          <ion-icon name="calendar"></ion-icon>
          {{ "CALENDAR.TITLE" | translate }}
        </ion-title>
      </ion-navbar>
    </ion-header>
    
    <ion-content padding>  
      <filterize-tbd feature="calendar"></filterize-tbd>
      <ion-list [virtualScroll]="items$ | async">
        <ion-button ion-item *virtualItem="let nb" (click)="clickNotebook(nb)">
          <ion-label>
            <filterize-notebook-title [notebook]="nb"></filterize-notebook-title>
          </ion-label>
          <ion-toggle 
            [checked]="nb.calendar_active" 
            [disabled]="!nb['#can_edit']" 
            (click)="$event.stopPropagation()"
            (ionChange)="clickToggle(nb, $event.checked)">
          </ion-toggle>
        </ion-button>
      </ion-list>
     
    </ion-content>
  `
})
export class CalendarComponent {
  items$: Observable<Notebook[]>;
  detailsPage = CalendarDetailsComponent;

  constructor(private store: Store<AppState>,
              private actions$: Actions,
              private alertCtrl: AlertController,
              private resourceSrv: ResourcesService,
              private navCtrl: NavController,
              private translate: TranslateService) {
    this.items$ = resourceSrv.getNotebooks();
  }

  clickNotebook(nb: Notebook) {
    if (nb.calendar_active) {
      this.store.select("current_user").first().subscribe(user =>
        this.navCtrl.push(CalendarDetailsComponent, {
          profile: user["profile"],
          business: user["business"],
          guid: nb.guid
        })
      );
    }
  }

  clickToggle(nb: Notebook, state) {
    this.store.dispatch({
      type: state ? CalendarActions.ENABLE : CalendarActions.DISABLE,
      payload: nb.guid
    })
  }

}
