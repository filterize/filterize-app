import { Component, Input, OnInit, OnChanges, SimpleChanges, Output, EventEmitter } from "@angular/core";
import { ConditionActionSpec } from "../../filter/filter.spec";
@Component({
  selector: "filterize-condition-action-field",
  template: `
    <ion-item *ngIf="edit_inline">
      <ion-label floating>{{ spec.title | filterize_translate }}</ion-label>
      <ion-input [(ngModel)]="value" (ionChange)="updateValue()"></ion-input>
    </ion-item>
  `
})
export class ConditionActionFieldComponent implements OnInit, OnChanges{
  @Input() spec: ConditionActionSpec;
  @Input() conditionOrAction: any;
  @Output() conditionOrActionChange: EventEmitter<any> = new EventEmitter<any>();

  value: any;
  edit_inline: boolean;

  ngOnInit(): void {
    this.value = this.conditionOrAction[this.spec.name];
    this.edit_inline = true;
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.ngOnInit();
  }

  updateValue() {
    this.conditionOrAction[this.spec.name] = this.value;
    this.conditionOrActionChange.emit(this.conditionOrAction);
  }

}
