import { Component } from "@angular/core";
import { NavParams, ViewController } from "ionic-angular";
import { ConditionActionSpec, FilterAction, FilterCondition } from "../../filter/filter.spec";
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
          {{ spec.title | filterize_translate }}
        </ion-title>
        
        <ion-buttons right>
          <button ion-button icon-only (click)="dismiss(value)">
            <ion-icon name="checkmark"></ion-icon>
          </button>
        </ion-buttons>

      </ion-navbar>
    </ion-header>
    
    <ion-content>  
      <filterize-tbd feature="filter"></filterize-tbd>
      <p *ngIf="spec.description">{{ spec.description }}</p>
      
      <ion-list>
        <ion-item *ngIf="show_not">
          <ion-label>{{ "FILTER.NEGATE" | translate }}</ion-label>
          <ion-toggle
            [checked]="value.not"
            (ionChange)="clickNegate($event.checked)"
            [disabled]="!can_edit"
          >
          </ion-toggle>
        </ion-item>
        
        <filterize-condition-action-field
          *ngFor="let field of spec.parameters"
          [spec]="field"
          [(conditionOrAction)]="value"
          [can_edit]="can_edit"
        >
        </filterize-condition-action-field>
      </ion-list>
      
    </ion-content>
  `
})
export class ConditionActionEditComponent {
  spec: ConditionActionSpec;
  value: FilterAction | FilterCondition;
  show_not: boolean;
  can_edit: boolean;

  constructor(private params: NavParams, private viewCtrl: ViewController) {
    this.spec = params.get("spec");
    this.value = params.get("value");
    this.show_not = !!params.get("show_not");
    this.can_edit = params.get("can_edit");
  }

  dismiss(value: any) {
    this.viewCtrl.dismiss(value);
  }

  clickNegate(state: boolean) {
    this.value["not"] = state;
  }
}
