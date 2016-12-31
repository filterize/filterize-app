import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Store } from '@ngrx/store'
import { AppState } from "../../app/appstate";
import * as UserActions from "../../user/user.actions";
import { Actions } from "@ngrx/effects";
import { AlertController, ModalController } from "ionic-angular";
import { TranslateService } from "ng2-translate";
import { Observable } from "rxjs";
import { currentUserSelector } from "../../user/user.selectors";
import { UserService } from "../../services/user.service";
import { UserSelectComponent } from "../../user/user-select.component";


@Component({
  selector: "filterize-side-menu",
  template: `
  <ion-menu [content]="content" persistent="true">
    <ion-header>
      <ion-toolbar>
        <ion-title>
          <ion-icon name="person"></ion-icon>
          {{ "UI.MENU" | translate }}
        </ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content padding>  
      <ion-list>
        <filterize-user-button 
          *ngIf="currentUser$ | async" 
          [user]="currentUser$ | async"
          (click)="openUserSelect()"></filterize-user-button>
        <button list-item (click)="openUserSelect()">
          open
        </button>
        <ion-item>
          <ion-label floating>{{ "USER.E_MAIL" | translate }}</ion-label>
          <ion-input type="text" [(ngModel)]="email" name="email"></ion-input>
        </ion-item>
      
        <ion-item>
          <ion-label floating>{{ "USER.PASSWORD" | translate }}</ion-label>
          <ion-input type="password" [(ngModel)]="password" name="password"></ion-input>
        </ion-item>
      </ion-list>
      
    </ion-content>
  </ion-menu>
  `
})
export class SideMenuComponent {
  currentUser$;

  constructor(private store: Store<AppState>,
              private translate: TranslateService,
              private userService: UserService,
              private modalCtrl: ModalController
              ) {
    this.currentUser$ = userService.getCurrentUser()
  }

  @Input() content;

  openUserSelect() {
    console.log("user_select");
    let modal = this.modalCtrl.create(UserSelectComponent);
    modal.present();
  }

}
