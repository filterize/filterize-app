import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { Store } from '@ngrx/store'
import { AppState } from "../../app/appstate";
import * as UserActions from "../../user/user.actions";
import { Actions } from "@ngrx/effects";
import { AlertController, ModalController, NavController, App } from "ionic-angular";
import { TranslateService } from "ng2-translate";
import { Observable } from "rxjs";
import { currentUserSelector } from "../../user/user.selectors";
import { UserService } from "../../services/user.service";
import { UserSelectComponent } from "../../user/user-select.component";
import { LoginSignupComponent } from "../login/login-signup.component";
import { HomePage } from "../home/home";
import { TagHierarchyComponent } from "../tag-hierarchy/tag-hierarchy.component";
import { ResourcesService } from "../../filterize-ressources/resources.service";
import { DashboardComponent } from "../dashboard/dashboard.component";
import { FilterComponent } from "../filter/filter.component";
import { CalendarComponent } from "../calendar/calendar.component";
import { MailInComponent } from "../mail-in/mail-in.component";
import { LibraryComponent } from "../library/library.component";
import { PaymentComponent } from "../payment/payment.component";
import { SettingsComponent } from "../settings/settings.component";
import { ZendeskService } from "../../services/zendesk.service";
import { FilterGroupsComponent } from "../filter/filter-groups.component";

let COMPONENTS = {
  dashboard: DashboardComponent,
  login: LoginSignupComponent,
  hierarchy: TagHierarchyComponent,
  filter: FilterGroupsComponent,
  calendar: CalendarComponent,
  library: LibraryComponent,
  mail_in: MailInComponent,
  payment: PaymentComponent,
  settings: SettingsComponent
};

@Component({
  selector: "filterize-side-menu",
  template: `
  <ion-menu [content]="content" [enabled]="enabled" persistent="true" type="push" mamaMenuExposeWhen>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>
          <ion-icon name="menu"></ion-icon> &nbsp;
          {{ "MENU.TITLE" | translate }}
        </ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content padding>  
      <ion-list no-lines>
        <filterize-user-button 
          *ngIf="currentUser$ | async" 
          [user]="currentUser$ | async"
          (click)="openUserSelect()">  
        </filterize-user-button>
        
        <ion-item>
          <ion-grid>
            <ion-row>
              <ion-col width-50>
                <button ion-button block small menuClose (click)="goto('login')">
                  <ion-icon name="log-in"></ion-icon>
                  {{ "LOGIN.LOGIN" | translate }}
                </button>
              </ion-col>
              <ion-col width-50>
                <button ion-button block small outline (click)="clickLogout()">
                  <ion-icon name="log-out"></ion-icon>
                  {{ "LOGIN.LOGOUT" | translate }}
                </button>
              </ion-col>
            </ion-row>
          </ion-grid>
        </ion-item>
        
        <ion-item *ngIf="(currentUser$ | async)?.business_id">
          <ion-segment [ngModel]="business$ | async">
            <ion-segment-button [value]="false" (click)="selectBusiness(false)">
              <ion-icon name="person"></ion-icon> &nbsp;
              {{ "USER.PRIVATE" | translate }}
            </ion-segment-button>
            <ion-segment-button [value]="true" (click)="selectBusiness(true)">
              <ion-icon name="briefcase"></ion-icon> &nbsp;
              {{ "USER.BUSINESS" | translate }}
            </ion-segment-button>
          </ion-segment>
        </ion-item>
        
        <button ion-item menuClose (click)="goto('dashboard')">
          <ion-avatar item-left><ion-icon name="speedometer"></ion-icon></ion-avatar>
          {{ "DASHBOARD.TITLE" | translate }}
        </button>

        <button ion-item menuClose (click)="goto('hierarchy')">
          <ion-avatar item-left><ion-icon name="git-pull-request"></ion-icon></ion-avatar>
          {{ "HIERARCHY.TITLE" | translate }}
        </button>

        <button ion-item menuClose (click)="goto('filter')">
          <ion-avatar item-left><ion-icon name="funnel"></ion-icon></ion-avatar>
          {{ "FILTER.TITLE" | translate }}
        </button>

        <button ion-item menuClose (click)="goto('calendar')">
          <ion-avatar item-left><ion-icon name="calendar"></ion-icon></ion-avatar>
          {{ "CALENDAR.TITLE" | translate }}
        </button>

        <button ion-item menuClose (click)="goto('mail_in')">
          <ion-avatar item-left><ion-icon name="mail"></ion-icon></ion-avatar>
          {{ "MAIL_IN.TITLE" | translate }}
        </button>

        <button ion-item menuClose (click)="goto('payment')">
          <ion-avatar item-left><ion-icon name="card"></ion-icon></ion-avatar>
          {{ "PAYMENT.TITLE" | translate }}
        </button>

        <button ion-item menuClose (click)="goto('library')">
          <ion-avatar item-left><ion-icon name="map"></ion-icon></ion-avatar>
          {{ "LIBRARY.TITLE" | translate }}
        </button>

        <button ion-item menuClose (click)="goto('settings')">
          <ion-avatar item-left><ion-icon name="settings"></ion-icon></ion-avatar>
          {{ "SETTINGS.TITLE" | translate }}
        </button>

        <button ion-item menuClose (click)="startSupport()">
          <ion-avatar item-left><ion-icon name="help"></ion-icon></ion-avatar>
          {{ "ZENDESK.SUPPORT" | translate }}
        </button>

      </ion-list>
      <br><br><br>
      
    </ion-content>
    
    <ion-footer>
      <ion-toolbar>
        <ion-buttons>
          <button ion-button full (click)="startSync()">
            <ion-icon name="sync"></ion-icon> &nbsp;
            {{ "UI.SYNC" | translate }} &nbsp;
            <ion-badge right *ngIf="openSync$ | async">{{ openSync$ | async }}</ion-badge>
          </button>
        </ion-buttons>
        <!--<ion-badge right *ngIf="openSync$ | async">{{ openSync$ | async }}</ion-badge>-->
        <!--<ion-title>Footer</ion-title>-->
      </ion-toolbar>
    </ion-footer>
  </ion-menu>
  `,
  styles: [`
    ion-avatar {
      min-height: unset;
      min-width: 1.5rem;
      text-align: center;
    }
  `]

})
export class SideMenuComponent {
  @Input() enabled = true;

  currentUser$;
  business$;
  openSync$;

  constructor(private store: Store<AppState>,
              private translate: TranslateService,
              private userService: UserService,
              private modalCtrl: ModalController,
              private appCtrl: App,
              private resSrv: ResourcesService,
              private zendeskSrv: ZendeskService
              ) {
    this.currentUser$ = userService.getCurrentUser();
    this.business$ = userService.isBusiness();
    this.business$.subscribe(data => console.log(data));
    this.openSync$ = resSrv.getOpenSyncCount();
  }

  @Input() content;

  goto(target) {
    this.currentUser$.first().subscribe(user => console.log("goto", "user", user));
    console.log("preif");
    if (target in COMPONENTS) {
      console.log("if");
      this.appCtrl.getRootNav().setRoot(COMPONENTS[target]);
    }
  }

  openUserSelect() {
    console.log("user_select");
    let modal = this.modalCtrl.create(UserSelectComponent);
    modal.present();
  }

  clickLogout() {
    this.currentUser$.first().subscribe(
      user => {
        if (user) {
          this.store.dispatch({type: UserActions.LOGOUT, payload: user._id});
        }
      }
    );
  }

  selectBusiness(value) {
    this.store.dispatch({type: UserActions.SELECT_BUSINESS, payload: value});
  }

  startSync() {
    this.store.dispatch({
      type: "CHECK_TOKEN",
      payload: {
        type: "START_USER_SYNC"
      }
    });
  }

  startSupport() {
    this.zendeskSrv.startSupport();
  }
}
