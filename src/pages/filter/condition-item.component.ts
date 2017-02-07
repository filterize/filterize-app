import { Component, Input, OnInit } from "@angular/core";
import { FilterCondition } from "../../filter/filter.spec";
@Component({
  selector: "filterize-condition-item",
  template: `
    <button ion-item (click)="click()">
      <span [innerHTML]="space"></span>
      <ion-icon name="arrow-dropright" *ngIf="collapse && condition.conditions?.length > 0"></ion-icon>
      <ion-icon name="arrow-dropdown" *ngIf="!collapse && condition.conditions?.length > 0"></ion-icon>
      {{ condition.type }}
    </button>
    
    <filterize-condition-item
      *ngFor="let cond of (!collapse && condition.conditions ? condition.conditions : [])" 
      [condition]="cond"
      [level]="level + 1">
    </filterize-condition-item>
  `
})
export class ConditionItemComponent implements OnInit {
  @Input() condition: FilterCondition;
  @Input() level: number = 0;
  @Input() collapse: boolean = false;
  space: string = "";

  ngOnInit() {
    this.space = "&nbsp;&nbsp;&nbsp;".repeat(Math.max(0, this.level));
  }

  click() {
    this.collapse = !this.collapse;
  }
}
