import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store'
import { AppState } from "../../app/appstate";
import * as UserActions from "../../user/user.actions";
import { Actions } from "@ngrx/effects";
import { AlertController, ViewController, NavParams, ModalController } from "ionic-angular";
import { TranslateService } from "ng2-translate";
import { Filter, FilterCondition, FilterAction } from "../../filter/filter.spec";
import { ConditionActionSelectComponent } from "./condition-action-select.component";
import { ConditionActionEditComponent } from "./condition-action-edit.component";


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
        
        <filterize-condition-item 
          [condition]="data.condition" 
          [can_edit]="can_edit" 
          (conditionChange)="conditionChanged($event)"
          >
        </filterize-condition-item>
        
        <ion-list-header>
          {{ "FILTER.ACTIONS" | translate }}
          <ion-icon item-right name="add-circle" (click)="addAction()"></ion-icon>
          <ion-icon item-right name="reorder" (click)="reorder=!reorder"></ion-icon>
        </ion-list-header>
        
        <ion-item-group [reorder]="reorder" (ionItemReorder)="$event.applyTo(data.action)">
          <filterize-action-item 
            *ngFor="let a of data.action; let i = index" 
            [action]="a" 
            [can_edit]="can_edit"
            (actionChange)="actionChanged($event, i)"
            (actionDelete)="actionDelete(i)"
            [reorder]="reorder"
            >
          </filterize-action-item>
        </ion-item-group>
        
      </ion-list>
      
    </ion-content>
  `
})
export class FilterComponent implements OnInit {
  data: Filter;
  can_edit: boolean;
  reorder = false;
  test = ["a", "b", "c"];

  constructor(private params: NavParams,
              private viewCtrl: ViewController,
              private translate: TranslateService,
              private modalCtrl: ModalController) {}

  ngOnInit() {
    this.data = JSON.parse(JSON.stringify(this.params.get("filter")));
    this.can_edit = !!this.data["#can_edit"];
  }

  addAction() {
    let modal = this.modalCtrl.create(ConditionActionSelectComponent, {
      type: "action"
    });
    modal.onDidDismiss(data => {
      if (data != null) {
        let action = data["obj"];
        let modal = this.modalCtrl.create(ConditionActionEditComponent, {
          spec: data["spec"],
          value: action,
          show_not: false,
          can_edit: true
        });
        modal.onDidDismiss(value => {
          if (value != null) {
            this.data.action.push(value);
          }
        });
        modal.present();
      }
    });
    modal.present();
  }

  conditionChanged(cond: FilterCondition) {
    this.data.condition = cond;
    console.log("cond changed", cond);
  }

  actionChanged(act: FilterAction, idx: number) {
    console.log("action changed", act, idx);
    this.data.action[idx] = act;
  }

  actionDelete(idx: number) {
    this.data.action.splice(idx, 1);
  }

  dismiss(filter?: Filter) {
    this.viewCtrl.dismiss(filter);
  }

}
