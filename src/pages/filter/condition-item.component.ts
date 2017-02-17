import { Component, Input, OnInit, OnChanges, SimpleChanges, EventEmitter, Output } from "@angular/core";
import { FilterCondition, ConditionActionSpec } from "../../filter/filter.spec";
import { FilterService } from "../../filter/filter.service";
import { ModalController, ItemSliding } from "ionic-angular";
import { ConditionActionEditComponent } from "./condition-action-edit.component";
import { ConditionActionSelectComponent } from "./condition-action-select.component";
@Component({
  selector: "filterize-condition-item",
  template: `
    <ion-item-sliding #item>
      <button ion-item (click)="click()">
        <span [innerHTML]="space"></span>
        <ion-icon name="arrow-dropright" *ngIf="collapse && condition.conditions?.length > 0"></ion-icon>
        <ion-icon name="arrow-dropdown" *ngIf="!collapse && condition.conditions?.length > 0"></ion-icon>
        <ion-icon name="alert" *ngIf="condition.not" color="danger"></ion-icon>
        {{ spec?.title | filterize_translate }}
        <ion-note item-right *ngIf="note">{{ note }}</ion-note>
        <ion-icon item-right 
          *ngIf="spec.sub_conditions" 
          name="add-circle" 
          (click)="addCondition($event)"
          >
        </ion-icon>
      </button>
      <ion-item-options>
        <button ion-button (click)="inverse(item)">
          <ion-icon name="alert"></ion-icon>
          {{ "FILTER.INVERSE" | translate}}
        </button>
        <button ion-button color="danger" (click)="conditionDelete.emit(true)" *ngIf="level > 0">
          <ion-icon name="trash"></ion-icon>
          {{ "UI.DELETE" | translate}}
        </button>
      </ion-item-options>
    </ion-item-sliding>
    
    <filterize-condition-item
      *ngFor="let cond of (!collapse && condition.conditions ? condition.conditions : []); let i = index" 
      [condition]="cond"
      [level]="level + 1"
      [can_edit]="can_edit"
      (conditionChange)="childConditionChanged($event, i)"
      (conditionDelete)="deleteCondition(i)"
      >
    </filterize-condition-item>
  `
})
export class ConditionItemComponent implements OnInit, OnChanges {
  @Input() condition: FilterCondition;
  @Input() level: number = 0;
  @Input() collapse: boolean = false;
  @Input() can_edit: boolean = true;
  @Output() conditionChange: EventEmitter<FilterCondition> = new EventEmitter<FilterCondition>();
  @Output() conditionDelete: EventEmitter<any> = new EventEmitter();
  space: string = "";
  note: string;

  spec: ConditionActionSpec = {} as ConditionActionSpec;

  constructor(private filterSrv:FilterService, private modalCtrl: ModalController) {}

  loadSpec() {
    this.spec = this.filterSrv.getConditionSpecByName(this.condition.type);
    this.note = this.filterSrv.getFirstFieldValueLabel(this.condition, this.spec);
  }

  ngOnInit() {
    this.space = "&nbsp;&nbsp;&nbsp;".repeat(Math.max(0, this.level));
    this.loadSpec();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.loadSpec();
  }

  click() {
    if (this.condition.conditions != null) {
      this.collapse = !this.collapse;
    }
    else {
      let modal = this.modalCtrl.create(ConditionActionEditComponent, {
        spec: this.spec,
        value: this.condition,
        show_not: true,
        can_edit: this.can_edit
      });
      modal.onDidDismiss(value => {
        if (value != null) {
          if (value == false) {
            this.conditionDelete.emit(true);
          } else {
            this.condition = value;
            this.conditionChange.emit(value)
          }
        }
      });
      modal.present();
    }
  }

  childConditionChanged(cond: FilterCondition, idx: number) {
    this.condition.conditions[idx] = cond;
    console.log("child cond changed", cond, idx);
    this.conditionChange.emit(this.condition);
  }

  addCondition(event) {
    event.stopPropagation();
    let modal = this.modalCtrl.create(ConditionActionSelectComponent, {
      type: "condition"
    });
    modal.onDidDismiss(data => {
      if (data != null) {
        let cond = data["obj"];
        let modal = this.modalCtrl.create(ConditionActionEditComponent, {
          spec: data["spec"],
          value: cond,
          show_not: true,
          can_edit: true
        });
        modal.onDidDismiss(value => {
          if (value != null && value != false) {
            this.condition.conditions.push(value);
          }
        });
        modal.present();
      }
    });
    modal.present();
  }

  deleteCondition(idx: number) {
    this.condition.conditions.splice(idx, 1);
  }

  inverse(item: ItemSliding) {
    item.close();
    this.condition.not = !this.condition.not;
    this.conditionChange.emit(this.condition);
  }
}
