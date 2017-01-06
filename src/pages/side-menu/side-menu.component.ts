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
                <button ion-button block small menuClose (click)="clickLogin()">
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
              {{ "USER.PRIVATE" | translate }}
            </ion-segment-button>
            <ion-segment-button [value]="true" (click)="selectBusiness(true)">
              {{ "USER.BUSINESS" | translate }}
            </ion-segment-button>
          </ion-segment>
        </ion-item>
        
        <button ion-item (click)="clickHierarchy()">
          <ion-icon name="git-pull-request"></ion-icon> &nbsp;
          {{ "HIERARCHY.TITLE" | translate }}
        </button>

      </ion-list>
      
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
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class SideMenuComponent {
  @Output() goto = new EventEmitter();
  @Input() enabled = true;

  currentUser$;
  business$;
  openSync$;

  constructor(private store: Store<AppState>,
              private translate: TranslateService,
              private userService: UserService,
              private modalCtrl: ModalController,
              private appCtrl: App,
              private resSrv: ResourcesService
              ) {
    this.currentUser$ = userService.getCurrentUser();
    this.business$ = userService.isBusiness();
    this.business$.subscribe(data => console.log(data));
    this.openSync$ = resSrv.getOpenSyncCount();
  }

  @Input() content;

  openUserSelect() {
    console.log("user_select");
    let modal = this.modalCtrl.create(UserSelectComponent);
    modal.present();
  }

  clickLogin() {
    this.appCtrl.getRootNav().push(LoginSignupComponent);
  }

  clickHierarchy() {
    this.appCtrl.getRootNav().push(TagHierarchyComponent);
  }

  clickLogout() {
    this.currentUser$.first().subscribe(
      user => this.store.dispatch({type: UserActions.LOGOUT, payload: user._id})
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

}
