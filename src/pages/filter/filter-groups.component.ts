import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store'
import { AppState } from "../../app/appstate";
import * as UserActions from "../../user/user.actions";
import { Actions } from "@ngrx/effects";
import { AlertController, NavController } from "ionic-angular";
import { TranslateService } from "ng2-translate";
import { FilterStacksComponent } from "./filter-stacks.component";
import { FilterService } from "../../filter/filter.service";
import { Observable, Subscription } from "rxjs";


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
      <ion-list>
        <button ion-item (click)="selectGroup('my')">
          {{ "FILTER.MY" | translate }}
        </button>
        <button ion-item *ngIf="user?.business" (click)="selectGroup('global')">
          {{ "FILTER.GLOBAL" | translate }}
        </button>
        <button ion-item *ngFor="let u of (otherUsers$ | async)" (click)="selectGroup(u.user)">
          {{ u.name }}
        </button>
      </ion-list>
    </ion-content>
  `
})
export class FilterGroupsComponent implements OnInit, OnDestroy {
  user: any;
  otherUsers$;

  sub: Subscription;

  constructor(private store: Store<AppState>,
              private actions$: Actions,
              private alertCtrl: AlertController,
              private nav: NavController,
              private filterSrv: FilterService,
              private translate: TranslateService) {
    this.otherUsers$ = filterSrv.getOtherUsers();
  }

  ngOnInit(): void {
    this.sub = this.store.select("current_user")
      .subscribe(user => {
        this.user = user;
        if (!user["business"]) {
          this.selectGroup("my");
        }
      })
  }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  selectGroup(group) {
    this.nav.push(FilterStacksComponent, {
      "profile": this.user["profile"],
      "business": this.user["business"],
      "group": group
    });
  }



}
