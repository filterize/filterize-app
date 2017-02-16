import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from "@angular/core";
import { SelectItem } from "./search-select.spec";
import { ModalController } from "ionic-angular";
import { SearchSelectModalComponent } from "./search-select-modal.component";
@Component({
  selector: "filterize-select",
  template: `
    <button *ngIf="!hideOnEmpty || searchItemsProcessed.length > 0" ion-item (click)="openModal()">
      <small *ngIf="label" style="color: #999;">{{ title | filterize_translate }}</small>
      <span *ngIf="!label" style="color: #999;">{{ title | filterize_translate }}</span><br>
      {{ label }}
      <ion-icon name="arrow-dropright" item-right></ion-icon>
    </button>
  `
})
export class SearchSelectComponent implements OnInit, OnChanges {
  @Input() searchItems: SelectItem[] = [];
  @Input() title: string;
  @Input() showHeader: boolean = true;
  @Input() value: string = null;
  @Input() icon: string = "";
  @Input() hideOnEmpty = true;
  @Output() valueChange: EventEmitter<string> = new EventEmitter<string>();

  private label:string = "";
  private searchItemsProcessed: SelectItem[] = [];

  constructor(private modalCtrl: ModalController) {
    this.prepareSearchItems();
  }

  ngOnInit(): void {
    this.updateLabel();
    this.prepareSearchItems();
    console.log(this.searchItems);
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.prepareSearchItems();
    this.updateLabel();
  }

  prepareSearchItems() {
    if (!this.searchItems) {
      this.searchItemsProcessed = [];
      return;
    }
    if (this.searchItems instanceof Array) {
      this.searchItemsProcessed = this.searchItems;
      return
    }
    this.searchItemsProcessed = Object.keys(this.searchItems)
      .map(key => Object({value: key, label: this.searchItems[key]}))
      .filter(obj => !obj.value.startsWith("#") && !obj.value.startsWith("_"))
      .sort((a: SelectItem, b: SelectItem) => a.label < b.label ? -1 : 1);
  }

  updateLabel() {
    let obj = this.searchItemsProcessed.find(obj => obj.value == this.value);
    this.label = obj ? obj.label : this.value;
  }

  openModal() {
    let modal = this.modalCtrl.create(
      SearchSelectModalComponent,
      {
        searchItems: this.searchItemsProcessed,
        value: this.value,
        icon: this.icon,
        showHeader: this.showHeader
      }
    );
    modal.onDidDismiss((value:string) => {
      if (value != null) {
        this.value = value;
        this.valueChange.emit(value);
      }
    });
    modal.present();
  }

}
