import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store'
import { AppState } from "../../app/appstate";
import * as UserActions from "../../user/user.actions";
import { Actions } from "@ngrx/effects";
import { AlertController, NavParams, NavController } from "ionic-angular";
import { TranslateService } from "ng2-translate";
import { Observable } from "rxjs";
import { FilterService } from "../../filter/filter.service";
import { FilterListComponent } from "./filter-list.component";


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
      <ion-list [virtualScroll]="stacks$ | async">
        <button ion-item *virtualItem="let stack" (click)="selectStack(stack)">
          <span *ngIf="stack != '__EMPTY__'">{{ stack }}</span>
          <i *ngIf="stack == '__EMPTY__'">{{ "FILTER.NO_STACK" | translate }}</i>
        </button>
      </ion-list>
    </ion-content>
  `
})
export class FilterStacksComponent {
  stacks$: Observable<string[]>;
  business: string|boolean;
  group: string|number;
  profile: string;

  constructor(private store: Store<AppState>,
              private actions$: Actions,
              private alertCtrl: AlertController,
              private params: NavParams,
              private nav: NavController,
              private filterSrv: FilterService,
              private translate: TranslateService) {
    this.business = params.get("business");
    this.group = params.get("group");
    this.profile = params.get("profile");

    this.stacks$ = this.filterSrv.getStacksByGroup(
      this.business,
      this.group
    )
  }

  selectStack(stack) {
    if (!stack) {
      stack = "__EMPTY__";
    }
    this.nav.push(FilterListComponent, {
      "profile": this.profile,
      "business": this.business,
      "group": this.group,
      "stack": stack
    });
  }

}
