import { Component, Input, EventEmitter, Output } from '@angular/core';
import { Store } from "@ngrx/store";
import { AppState } from "../app/appstate";
import * as UserActions from "./user.actions";
import { ModalController, ViewController } from "ionic-angular";


@Component({
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons start>
          <button ion-button ion-icon (click)="dismiss()">
            <ion-icon name="close"></ion-icon>
          </button>
        </ion-buttons>
        
        <ion-title>
          {{ "UI.SELECT_USER" | translate }}
        </ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content padding>  
      <ion-list>
        <filterize-user-button 
          *ngFor="let user of (users$ | async)" 
          [user]="user"
          (click)="selectUser(user._id)">
        </filterize-user-button>
      </ion-list>
      
    </ion-content>
  `
})
export class UserSelectComponent {
  users$;

  constructor(private store: Store<AppState>, private viewCtrl: ViewController) {
    this.users$ = store.select("userlist");
    this.users$.subscribe(data => console.log("data:", data));
    console.log("test")

  }

  selectUser(user_id) {
    console.log(user_id);
    this.store.dispatch({
      type: UserActions.SELECT,
      payload: user_id
    });
    this.dismiss()
  }

  onNgInit() {
    console.log("init select");
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }
}
