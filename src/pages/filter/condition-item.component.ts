import { Component, Input, OnInit, OnChanges, SimpleChanges } from "@angular/core";
import { FilterCondition, ConditionActionSpec } from "../../filter/filter.spec";
import { FilterService } from "../../filter/filter.service";
import { ModalController } from "ionic-angular";
import { ConditionActionEditComponent } from "./condition-action-edit.component";
@Component({
  selector: "filterize-condition-item",
  template: `
    <button ion-item (click)="click()">
      <span [innerHTML]="space"></span>
      <ion-icon name="arrow-dropright" *ngIf="collapse && condition.conditions?.length > 0"></ion-icon>
      <ion-icon name="arrow-dropdown" *ngIf="!collapse && condition.conditions?.length > 0"></ion-icon>
      <ion-icon name="alert" *ngIf="condition.not" color="danger"></ion-icon>
      {{ spec?.title | filterize_translate }}
      <ion-note item-right *ngIf="note">{{ note }}</ion-note>
    </button>
    
    <filterize-condition-item
      *ngFor="let cond of (!collapse && condition.conditions ? condition.conditions : [])" 
      [condition]="cond"
      [level]="level + 1"
      [can_edit]="can_edit">
    </filterize-condition-item>
  `
})
export class ConditionItemComponent implements OnInit, OnChanges {
  @Input() condition: FilterCondition;
  @Input() level: number = 0;
  @Input() collapse: boolean = false;
  @Input() can_edit: boolean = true;
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
      modal.present();
    }
  }
}
