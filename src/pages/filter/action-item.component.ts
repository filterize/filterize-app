import { Component, Input, Output, EventEmitter } from "@angular/core";
import { FilterAction } from "../../filter/filter.spec";
@Component({
  selector: "filterize-action-item",
  template: `
    <ion-item>{{ action.type }}</ion-item>
  `
})
export class ActionItemComponent {
  @Input() action: FilterAction;
}
