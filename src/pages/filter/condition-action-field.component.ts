import { Component, Input, OnInit, OnChanges, SimpleChanges, Output, EventEmitter } from "@angular/core";
import { ConditionActionSpec, FieldSpec, FilterCondition, FilterAction } from "../../filter/filter.spec";
import { FilterService } from "../../filter/filter.service";
import { SelectItem } from "../../tools/search-select.spec";
@Component({
  selector: "filterize-condition-action-field",
  template: `
    <ion-item *ngIf="!can_edit">
      <small *ngIf="value_label" style="color: #999;">{{ spec.title | filterize_translate }}</small>
      <span *ngIf="!value_label" style="color: #999;">{{ spec.title | filterize_translate }}</span><br>
      {{ value_label }}
    </ion-item>
    
    <ion-item *ngIf="edit == 'inline'">
      <ion-label floating>{{ spec.title | filterize_translate }}</ion-label>
      <ion-input [(ngModel)]="value" (ionChange)="updateValue()"></ion-input>
    </ion-item>
    
    <ion-item *ngIf="edit == 'select'">
      <ion-label floating>{{ spec.title | filterize_translate }}</ion-label>
      <ion-select [(ngModel)]="value" (ionChange)="updateValue()">
        <ion-option *ngFor="let v of spec.values" [value]="v.value"> 
          {{ v.title | filterize_translate }}
        </ion-option>
      </ion-select>
    </ion-item>
    
    
  `
})
export class ConditionActionFieldComponent implements OnInit, OnChanges{
  @Input() spec: FieldSpec;
  @Input() conditionOrAction: FilterCondition | FilterAction;
  @Input() can_edit: boolean;
  @Output() conditionOrActionChange: EventEmitter<any> = new EventEmitter<any>();


  value: any;
  value_label: string;
  edit: string;
  select_items: SelectItem[] = [];

  constructor(private filterSrv: FilterService) {}

  ngOnInit(): void {
    this.value = this.conditionOrAction[this.spec.name];
    this.value_label = this.filterSrv.getFieldValueLabel(this.value, this.spec);
    this.setEditMode();
    console.log("edit mode", this.can_edit, this.edit);
  }

  setEditMode() {
    if (!this.can_edit) {
      this.edit = "";
      return;
    }

    this.edit = "inline";

    if (this.spec.values) {
      this.edit = "select";
    }

    if (this.spec.source) {
      this.edit = "search-select";

    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.ngOnInit();
  }

  updateValue() {
    this.conditionOrAction[this.spec.name] = this.value;
    this.conditionOrActionChange.emit(this.conditionOrAction);
  }

}
