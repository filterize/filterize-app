import { Component, OnInit } from "@angular/core";
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
      <ion-list>
        <ion-item *ngIf="spec.description" text-wrap>
          <p [innerHTML]="spec.description"></p>
        </ion-item>
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
        
        <button ion-item outline color="danger" (click)="dismiss(false)">
          {{ "UI.DELETE" | translate }}
        </button>
      </ion-list>
      
    </ion-content>
  `
})
export class ConditionActionEditComponent implements OnInit {
  spec: ConditionActionSpec;
  value: FilterAction | FilterCondition;
  show_not: boolean;
  can_edit: boolean;

  constructor(private params: NavParams, private viewCtrl: ViewController) {}

  ngOnInit(): void {
    this.spec = this.params.get("spec");
    this.value = JSON.parse(JSON.stringify(this.params.get("value")));
    this.show_not = !!this.params.get("show_not");
    this.can_edit = this.params.get("can_edit");
  }

  dismiss(value: any) {
    console.log("dismiss", value);
    this.viewCtrl.dismiss(value);
  }

  clickNegate(state: boolean) {
    this.value["not"] = state;
  }
}
