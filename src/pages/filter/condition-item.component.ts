import { Component, Input, OnInit, OnChanges, SimpleChanges } from "@angular/core";
import { FilterCondition, ConditionActionSpec } from "../../filter/filter.spec";
import { FilterService } from "../../filter/filter.service";
@Component({
  selector: "filterize-condition-item",
  template: `
    <button ion-item (click)="click()">
      <span [innerHTML]="space"></span>
      <ion-icon name="arrow-dropright" *ngIf="collapse && condition.conditions?.length > 0"></ion-icon>
      <ion-icon name="arrow-dropdown" *ngIf="!collapse && condition.conditions?.length > 0"></ion-icon>
      {{ spec?.title | filterize_translate }}
    </button>
    
    <filterize-condition-item
      *ngFor="let cond of (!collapse && condition.conditions ? condition.conditions : [])" 
      [condition]="cond"
      [level]="level + 1">
    </filterize-condition-item>
  `
})
export class ConditionItemComponent implements OnInit, OnChanges {
  @Input() condition: FilterCondition;
  @Input() level: number = 0;
  @Input() collapse: boolean = false;
  space: string = "";

  spec: ConditionActionSpec = {} as ConditionActionSpec;

  constructor(private filterSrv:FilterService) {}

  loadSpec() {
    this.spec = this.filterSrv.getConditionSpecByName(this.condition.type)
    console.log("load spec", this.spec, this.condition)
  }

  ngOnInit() {
    this.space = "&nbsp;&nbsp;&nbsp;".repeat(Math.max(0, this.level));
    this.loadSpec();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.loadSpec();
  }

  click() {
    this.collapse = !this.collapse;
  }
}
