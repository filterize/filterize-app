import { Component } from '@angular/core';
import { Store } from '@ngrx/store'
import { AppState } from "../../app/appstate";
import * as UserActions from "../../user/user.actions";
import { Actions } from "@ngrx/effects";
import { AlertController, NavParams } from "ionic-angular";
import { TranslateService } from "ng2-translate";
import { FilterService } from "../../filter/filter.service";
import { Observable } from "rxjs";
import { Filter } from "../../filter/filter.spec";
import { filter } from "rxjs/operator/filter";


@Component({
  template: `
    <ion-header>
      <ion-navbar>
        
        <button ion-button icon-only menuToggle>
          <ion-icon name="menu"></ion-icon>
        </button>
    
        <ion-title>
          <ion-icon name="funnel"></ion-icon>
          {{ "FILTER.TITLE" | translate }}
        </ion-title>
      </ion-navbar>
    </ion-header>
    
    <ion-content>  
     <filterize-tbd feature="filter"></filterize-tbd>
     <ion-list [virtualScroll]="filters$ | async">
        <button ion-item *virtualItem="let filter">
          <ion-label>{{ filter.name }}</ion-label>
          <ion-toggle 
            [disabled]="!filter['#can_edit']" 
            [checked]="filter.active" 
            (ionChange)="setFilterActive(filter, $event.checked)"
          ></ion-toggle>
        </button>
      </ion-list>
    </ion-content>
  `
})
export class FilterListComponent {
  stack: string;
  business: string|boolean;
  group: string|number;
  profile: string;
  filters$: Observable<Filter[]>;

  constructor(private store: Store<AppState>,
              private actions$: Actions,
              private alertCtrl: AlertController,
              private params: NavParams,
              private filterSrv: FilterService,
              private translate: TranslateService) {
    this.business = params.get("business");
    this.group = params.get("group");
    this.profile = params.get("profile");
    this.stack = params.get("stack");

    this.filters$ = this.filterSrv.getFilterByGroupAndStack(
      this.business,
      this.group,
      this.stack
    );
  }

  setFilterActive(filter: Filter, state: boolean) {
    this.store.dispatch({
      type: "FILTER_CHANGED",
      payload: {
        _id: filter._id,
        active: state
      }
    })
  }

}
