import { Component, Input, Output, EventEmitter } from "@angular/core";
import { FilterAction, ConditionActionSpec } from "../../filter/filter.spec";
import { FilterService } from "../../filter/filter.service";
@Component({
  selector: "filterize-action-item",
  template: `
    <ion-item>{{ action.type }}</ion-item>
  `
})
export class ActionItemComponent {

  @Input() action: FilterAction;
  spec: ConditionActionSpec = {} as ConditionActionSpec;

  constructor(private filterSrv:FilterService) {}

  loadSpec() {
    this.spec = this.filterSrv.getActionSpecByName(this.action.type)
  }
}
