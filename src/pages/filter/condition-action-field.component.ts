import { Component, Input, OnInit, OnChanges, SimpleChanges, Output, EventEmitter } from "@angular/core";
import { ConditionActionSpec, FieldSpec, FilterCondition, FilterAction } from "../../filter/filter.spec";
import { FilterService } from "../../filter/filter.service";
import { SelectItem } from "../../tools/search-select.spec";
import { Observable } from "rxjs";
import { Notebook } from "../../notebook/notebook.spec";
import { Tag } from "../../tags/tags.spec";
import { ResourcesService } from "../../filterize-ressources/resources.service";
import { USER_RESOURCES } from "../../filterize-ressources/resources.list";
import { i18n_dict } from "../../tools/tools.spec";
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
      <ion-input [type]="input_type" [(ngModel)]="value" (ngModelChange)="updateValue($event)"></ion-input>
    </ion-item>
    
    <ion-item *ngIf="edit == 'select'">
      <ion-label floating>{{ spec.title | filterize_translate }}</ion-label>
      <ion-select [(ngModel)]="value" (ionChange)="updateValue()">
        <ion-option *ngFor="let v of spec.values" [value]="v.value"> 
          {{ v.title | filterize_translate }}
        </ion-option>
      </ion-select>
    </ion-item>
    
    <ion-item *ngIf="edit == 'toggle'">
      <ion-label>{{ spec.title | filterize_translate }}</ion-label>
      <ion-toggle [(ngModel)]="value" (ionChange)="updateBoolean($event.checked)">
      </ion-toggle>
    </ion-item>
    
    <filterize-select *ngIf="edit == 'search-select'"
      [(value)]="value"
      [searchItems]="select_items"
      [title]="select_resource?.title"
      [icon]="select_resource?.icon"
    >
    </filterize-select>
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
  select_resource;
  input_type: string = "text";

  constructor(private filterSrv: FilterService, private resSrv: ResourcesService) {}

  ngOnInit(): void {
    this.value = this.conditionOrAction[this.spec.name];
    this.value_label = this.filterSrv.getFieldValueLabel(this.value, this.spec);
    this.setEditMode();
  }

  setEditMode() {
    if (!this.can_edit) {
      this.edit = "";
      return;
    }

    this.edit = "inline";
    this.input_type = (this.spec.type == "int" || this.spec.type == "number")
                        ? "number"
                        : "text";

    if (this.spec.values) {
      this.edit = "select";
    }

    if (this.spec.type == "boolean") {
      this.edit = "toggle"
    }

    if (this.spec.source) {
      this.edit = "search-select";
      let source_data$: Observable<(Notebook|Tag)[]>;
      switch (this.spec.source) {
        case "notebooks":
          source_data$ = this.resSrv.getNotebooks();
          this.select_resource = USER_RESOURCES.notebook;
          break;
        case "tags":
          source_data$ = this.resSrv.getTags();
          this.select_resource = USER_RESOURCES.tag;
          break;
      }
      if (source_data$) {
        source_data$
          .first()
          .subscribe((data:(Notebook|Tag)[]) => {
            this.select_items = data.map((obj:Notebook|Tag) => Object({
              value: obj.guid,
              label: obj.name
            }));
          })
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.ngOnInit();
  }

  updateValue(evt?) {
    console.log("update value", evt);
    this.conditionOrAction[this.spec.name] = this.value;
    this.conditionOrActionChange.emit(this.conditionOrAction);
  }

  updateBoolean(val: boolean) {
    this.value = val;
    this.updateValue();
  }

}
