import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from "@angular/core";
import { FilterAction, ConditionActionSpec } from "../../filter/filter.spec";
import { FilterService } from "../../filter/filter.service";
import { ConditionActionEditComponent } from "./condition-action-edit.component";
import { ModalController } from "ionic-angular";
@Component({
  selector: "filterize-action-item",
  template: `
    <ion-item-sliding #item>
      <button ion-item (click)="click()">
        {{ spec?.title | filterize_translate }}
        <ion-note item-right *ngIf="note">{{ note }}</ion-note>
      </button>
      <ion-item-options>
        <button ion-button color="danger" (click)="actionDelete.emit(true)">
          <ion-icon name="trash"></ion-icon>
          {{ "UI.DELETE" | translate}}
        </button>
      </ion-item-options>
    </ion-item-sliding>
  `
})
export class ActionItemComponent implements OnInit, OnChanges {
  @Input() action: FilterAction;
  @Input() can_edit: boolean = true;
  @Output() actionChange: EventEmitter<FilterAction> = new EventEmitter<FilterAction>();
  @Output() actionDelete: EventEmitter<any> = new EventEmitter();
  spec: ConditionActionSpec = {} as ConditionActionSpec;
  note: string;

  constructor(private filterSrv:FilterService, private modalCtrl: ModalController) {}

  loadSpec() {
    this.spec = this.filterSrv.getActionSpecByName(this.action.type);
    this.note = this.filterSrv.getFirstFieldValueLabel(this.action, this.spec);

  }

  ngOnInit(): void {
    this.loadSpec();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.loadSpec()
  }

  click() {
    let modal = this.modalCtrl.create(ConditionActionEditComponent, {
      spec: this.spec,
      value: this.action,
      show_not: false,
      can_edit: true
    });
    modal.onDidDismiss(value => {
      if (value != null) {
        if (value == false) {
          this.actionDelete.emit(true);
        } else {
          this.action = value;
          this.actionChange.emit(value)
        }
      }
    });
    modal.present();
  }

}
