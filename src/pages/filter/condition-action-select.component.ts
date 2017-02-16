import { Component, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import { AppState } from "../../app/appstate";
import { NavParams, ViewController } from "ionic-angular";
import { ConditionActionSpec, ConditionActionSpecStack } from "../../filter/filter.spec";
import { FilterService } from "../../filter/filter.service";
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
          {{ title | translate }}
        </ion-title>
      </ion-navbar>
    </ion-header>
    
    <ion-content>  
     
      <ion-list [virtualScroll]="specs" [headerFn]="headerFn">
      
        <ion-item-divider *virtualHeader="let header">
          {{ header | filterize_translate }}
        </ion-item-divider>
        
        <button ion-item *virtualItem="let item" (click)="select(item)">
          {{ item.title | filterize_translate }}
        </button>
      
      </ion-list>
      
    </ion-content>
  `
})
export class ConditionActionSelectComponent implements OnInit {
  type: string;
  specs: ConditionActionSpec[] = [];
  title: string = "";

  constructor(private filterSrv: FilterService,
              private params: NavParams,
              private viewCtrl: ViewController) {}

  ngOnInit(): void {
    this.type = this.params.get("type");
    switch (this.type) {
      case "action":
        this.title = "FILTER.NEW_ACTION";
        this.specs = this.filterSrv.getActionSpecs();
        break;
      case "condition":
        this.title = "FILTER.NEW_CONDITION";
        this.specs = this.filterSrv.getConditionSpecs();
        break;
      default:
        this.title = "unknown type";
        this.specs = [];
    }
  }

  headerFn(record: ConditionActionSpec, recordIndex: number, records: ConditionActionSpec[]) {
    if (recordIndex == 0 || (records[recordIndex-1] && record.stack != records[recordIndex-1].stack)) {
      return record.stack;
    }
    return null;
  }

  select(spec: ConditionActionSpec) {
    let field_obj = {type: spec.name};
    for (let field of spec.parameters) {
      let value;
      if (field.default != null) {
        value = field.default
      } else if (field.null) {
        value = null;
      } else if (field.values && field.values.length > 0) {
        value = field.values[0].value;
      } else if (field.type == "boolean") {
        value = false;
      } else if (field.type == "number" || field.type == "int") {
        value = 0;
      } else {
        value = "";
      }
      field_obj[field.name] = value;
    }
    if (spec.sub_conditions) {
      field_obj["conditions"] = [];
    }
    this.dismiss({obj: field_obj, spec:spec});
  }

  dismiss(data: any) {
    return this.viewCtrl.dismiss(data);
  }
}
