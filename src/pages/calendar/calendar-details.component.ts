import { Component } from '@angular/core';
import { Store } from '@ngrx/store'
import { AppState } from "../../app/appstate";
import { Actions } from "@ngrx/effects";
import { AlertController, NavParams } from "ionic-angular";
import { TranslateService } from "ng2-translate";
import { Observable, Subscription } from "rxjs";
import { Notebook } from "../../notebook/notebook.spec";
import { USER_RESOURCES } from "../../filterize-ressources/resources.list";
import { ignoreDeletedFilter } from "../../filterize-ressources/resources.tools";
import { notebookIgnoreDeleted, notebookSort } from "../../notebook/notebook.tools";
import { ResourcesService } from "../../filterize-ressources/resources.service";
import * as CalendarActions from "./calendar.actions"
import * as UserActions from "../../user/user.actions";
import { UserService } from "../../services/user.service";


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
      <ion-list no-lines>
        <ion-item *ngIf="(item$|async)?.stack">
          <strong>{{ (item$ |async)?.stack}}:</strong>
        </ion-item>
        <ion-item *ngIf="(item$ |async)?.name">{{ (item$ |async)?.name}}</ion-item>
        <ion-item *ngIf="!(item$ |async)?.name">{{ "CALENDAR.ALL" | translate }}</ion-item>
        <ion-item>
          <ion-label>{{ "CALENDAR.DURATION" | translate }}</ion-label>
          <ion-select [(ngModel)]="duration" (ionChange)="updateLink()">
            <ion-option value="1">1 min</ion-option>
            <ion-option value="5">5 min</ion-option>
            <ion-option value="10">10 min</ion-option>
            <ion-option value="15">15 min</ion-option>
            <ion-option value="30">30 min</ion-option>
            <ion-option value="60">60 min</ion-option>
            <ion-option value="90">90 min</ion-option>
            <ion-option value="120">120 min</ion-option>
            <ion-option value="day">{{ "CALENDAR.DAY" | translate }}</ion-option>
          </ion-select>
        </ion-item>
        <ion-item>
          <ion-label>{{ "CALENDAR.LINK_TYPE" | translate }}</ion-label>
          <ion-select [(ngModel)]="linkType" (ionChange)="updateLink()">
            <ion-option value="app">{{ "CALENDAR.LINK_APP" | translate }}</ion-option>
            <ion-option value="web">{{ "CALENDAR.LINK_WEB" | translate }}</ion-option>
          </ion-select>
        </ion-item>
        <ion-item *ngIf="(item$|async)?.calendar_token">
          <a [href]="link">{{ link }}</a>
        </ion-item>
        <ion-item *ngIf="!(item$|async)?.calendar_token">
          <ion-label color="danger">
            <ion-icon name="warning"></ion-icon>
            {{ "CALENDAR.SYNC_FIRST" | translate }}
          </ion-label>
        </ion-item>
      <button ion-item color="danger" (click)="revoke()" *ngIf="(item$|async)?.calendar_token">
        {{ "CALENDAR.REVOKE" | translate}}
      </button>
     </ion-list>
    </ion-content>
  `
})
export class CalendarDetailsComponent {
  item$: Observable<Notebook>;

  private profile: string;
  private business: boolean;
  private guid: string;
  private duration = "15";
  private linkType = "app";
  private link = "";
  private sub: Subscription;
  private lastNotebook: Notebook;

  constructor(private store: Store<AppState>,
              private actions$: Actions,
              private alertCtrl: AlertController,
              private resourceSrv: ResourcesService,
              private params: NavParams,
              private translate: TranslateService,
              private userSrv: UserService) {
    this.profile = this.params.get("profile");
    this.business = this.params.get("business") === true || this.params.get("business") === "true";
    this.guid = this.params.get("guid");

    this.store.select("current_user")
      .first()
      .subscribe(data => {
        if (data["profile_id"] != this.profile || data["business"] != this.business) {
          this.store.dispatch({
            type: UserActions.SELECT_WITH_BUSINESS,
            payload: {
              profile: this.profile,
              business: this.business
            }
          })
        }
      });

    if (this.guid != "all") {
      this.item$ = this.store.select(USER_RESOURCES.notebook.store)
        .map((nbs: Notebook[]) => nbs.find(nb => nb.guid === this.guid));
    } else {
      this.item$ = this.userSrv.getCurrentUser()
        .map(user => Object({
          calendar_token: user["calendar_token"],
          stack: null,
          name: null,
          _id: user["_id"]
        }))
    }

    console.log(this.profile, this.business, this.guid);
  }

  updateLink(nb) {
    if (nb) {
      this.lastNotebook = nb
    }
    if (this.lastNotebook) {
      this.link = `https://api.filterize.net/calendar/${this.lastNotebook.calendar_token}.ics?d=${this.duration}&link=${this.linkType}`;
    } else {
      this.link = "";
    }
  }

  ngOnInit() {
    this.sub = this.item$.subscribe(nb => {
      this.updateLink(nb);
      console.log("sub", nb)
    });
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  revoke() {
    if (this.guid != "all") {
      this.store.dispatch({
        type: CalendarActions.REVOKE,
        payload: this.guid
      });
    } else {
      this.store.dispatch({
        type: UserActions.CHANGED,
        payload: {
          _id: this.lastNotebook["_id"],
          calendar_token: ""
        }
      })
    }
  }

}
