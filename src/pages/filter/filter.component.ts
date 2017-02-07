import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store'
import { AppState } from "../../app/appstate";
import * as UserActions from "../../user/user.actions";
import { Actions } from "@ngrx/effects";
import { AlertController, ViewController, NavParams } from "ionic-angular";
import { TranslateService } from "ng2-translate";
import { Filter } from "../../filter/filter.spec";


@Component({
  template: `
    <ion-header>
      <ion-navbar>
        
        <ion-buttons left>
          <button ion-button icon-only (click)="dismiss()">
            <ion-icon name="close"></ion-icon>
          </button>
        </ion-buttons>
        
        <ion-title>
          <ion-icon name="funnel"></ion-icon>
          {{ "FILTER.TITLE" | translate }}
        </ion-title>
        
        <ion-buttons right>
          <button ion-button icon-only (click)="dismiss(data)">
            <ion-icon name="checkmark"></ion-icon>
          </button>
        </ion-buttons>

      </ion-navbar>
    </ion-header>
    
    <ion-content>  
      <filterize-tbd feature="filter"></filterize-tbd>
     
      <ion-list>
        <ion-item>
          <ion-label floating>{{ "FILTER.NAME" | translate }}</ion-label>
          <ion-input type="text" [(ngModel)]="data.name" [disabled]="!can_edit"></ion-input>
        </ion-item>
      
        <ion-item>
          <ion-label floating>{{ "FILTER.STACK" | translate }}</ion-label>
          <ion-input type="text" [(ngModel)]="data.stack" [disabled]="!can_edit"></ion-input>
        </ion-item>
      
        <ion-list-header>
          {{ "FILTER.CONDITIONS" | translate }}
        </ion-list-header>
        
        <filterize-condition-item [condition]="data.condition"></filterize-condition-item>
        
        <ion-list-header>
          {{ "FILTER.ACTIONS" | translate }}
          <ion-icon item-right name="add-circle" (click)="addAction()"></ion-icon>
        </ion-list-header>
        
        <filterize-action-item *ngFor="let a of data.action" [action]="a"></filterize-action-item>
      </ion-list>
      
    </ion-content>
  `
})
export class FilterComponent {
  data: Filter;
  can_edit: boolean;

  constructor(private params: NavParams,
              private viewCtrl: ViewController,
              private translate: TranslateService) {
    this.data = this.params.get("filter");
    console.log(this.data);
    this.can_edit = !!this.data["#can_edit"];
  }

  addAction() {
    console.log("add action");
  }

  dismiss(filter?: Filter) {
    this.viewCtrl.dismiss(filter);
  }

}
