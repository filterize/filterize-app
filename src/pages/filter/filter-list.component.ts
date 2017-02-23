import { Component } from '@angular/core';
import { Store } from '@ngrx/store'
import { AppState } from "../../app/appstate";
import * as UserActions from "../../user/user.actions";
import { Actions } from "@ngrx/effects";
import { AlertController, NavParams, ModalController, Modal } from "ionic-angular";
import { TranslateService } from "ng2-translate";
import { FilterService } from "../../filter/filter.service";
import { Observable } from "rxjs";
import { Filter } from "../../filter/filter.spec";
import { filter } from "rxjs/operator/filter";
import { FilterComponent } from "./filter.component";
import { v4 } from "uuid";
import { USER_RESOURCES } from "../../filterize-ressources/resources.list";


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
        
        <ion-buttons right>
          <button ion-button icon-only (click)="createFilter()">
            <ion-icon name="add"></ion-icon>
          </button>
          <button ion-button icon-only (click)="reorder = !reorder">
            <ion-icon name="reorder"></ion-icon>
          </button>
        </ion-buttons>

      </ion-navbar>
    </ion-header>
    
    <ion-content>  
      <filterize-tbd feature="filter"></filterize-tbd>
      <ion-list [reorder]="reorder" (ionItemReorder)="doReorder($event)">
        <ng-container *ngFor="let filter of (filters$|async)">
          <ion-item-sliding *ngIf="!reorder" #item>
            <button ion-item (click)="openFilter(filter)">
              <ion-label>{{ filter.name }}</ion-label>
              <ion-toggle 
                [disabled]="!filter['#can_edit']" 
                [checked]="filter.active" 
                (ionChange)="setFilterActive(filter, $event.checked)"
              ></ion-toggle>
            </button>
            <ion-item-options>
              <button ion-button color="danger" *ngIf="filter['#can_edit']">
                <ion-icon name="trash"></ion-icon>
                {{ "UI.DELETE" | translate}}
              </button>
           </ion-item-options>
          </ion-item-sliding>
 
          <button ion-item *ngIf="reorder" (click)="openFilter(filter)">
            <ion-label>{{ filter.name }}</ion-label>
            <ion-toggle 
              [disabled]="!filter['#can_edit']" 
              [checked]="filter.active" 
              (ionChange)="setFilterActive(filter, $event.checked)"
            ></ion-toggle>
          </button>
        </ng-container>
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
  reorder: boolean = false;

  constructor(private store: Store<AppState>,
              private actions$: Actions,
              private alertCtrl: AlertController,
              private modalCtrl: ModalController,
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

  openFilter(filter: Filter, signal?: string) {
    signal = signal ? signal : "FILTER_CHANGED";
    let modal = this.modalCtrl.create(FilterComponent, {
      filter: filter
    });
    modal.onDidDismiss((data) => {
      if (data != null) {
        this.store.dispatch({
          type: signal,
          payload: data
        })
      }
    });
    modal.present();
  }

  createFilter() {
    let filter: Filter = {
      name: "",
      action: [],
      condition: {
        type: "ALL",
        conditions: []
      },
      active: true,
      guid: v4(),
      "#can_edit": true,
    };

    if (this.stack != "__EMPTY__") {
      filter.stack = this.stack;
    }
    this.openFilter(filter, "FILTER_CREATED");
  }

  doReorder(index: {from: number, to:number}) {
    this.filters$
      .withLatestFrom(
        this.store
          .select("settings")
          .map(data => data["time_offset"])
          .map((data:number): number => data == null ? 0 : data)
      )
      .first()
      .subscribe(([filters, time_offset]) => {
        let cur_filter: Filter = filters[index.from];
        if (index.to == 0) {
          cur_filter.order = filters[0].order - 86400000; // = 24*60*60*1000 = 1 day
        } else if (index.to == filters.length - 1) {
          cur_filter.order = Math.round(new Date().getTime() + 1000*time_offset);
        } else {
          let to_fixed = index.to > index.from ? index.to : index.to - 1;
          cur_filter.order = Math.round((filters[to_fixed].order + filters[to_fixed + 1].order)/2);
        }
        this.store.dispatch({
          type: "FILTER_CHANGED",
          payload: cur_filter
        })
      });
    console.log("reorder", index);
  }

}
