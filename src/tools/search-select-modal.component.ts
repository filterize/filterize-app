import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from "@angular/core";
import { SelectItem } from "./search-select.spec";
import { NavParams, ViewController } from "ionic-angular";
@Component({
  template: `
    <ion-header>
      <ion-navbar>
        <ion-buttons left>
          <button ion-button icon-only (click)="dismiss()">
            <ion-icon name="close"></ion-icon>
          </button>
        </ion-buttons>
        <ion-searchbar [(ngModel)]="query" (ionInput)="filterItems($event)"></ion-searchbar>
      </ion-navbar>
    </ion-header>
    
    <ion-content>  
     
      <ion-list [virtualScroll]="filteredItems" [headerFn]="headerFn">
      
        <ion-item-divider *virtualHeader="let header">
          {{ header }}
        </ion-item-divider>
        
        <button ion-item *virtualItem="let item" (click)="dismiss(item.value)">
          {{ item.label }}
          <ion-icon *ngIf="item.value == value" name="checkmark" item-right></ion-icon>
        </button>
      
      </ion-list>
      
    </ion-content>
  `
})
export class SearchSelectModalComponent implements OnInit {
  searchItems: SelectItem[];
  value: string = null;
  icon: string = "";
  showHeader: boolean = true;

  private query: string = "";
  private filteredItems: SelectItem[] = [];

  constructor(private params:NavParams, private viewCtrl: ViewController) {
    this.searchItems = params.get("searchItems");
    this.value = params.get("value");
    this.icon = params.get("icon");
    this.showHeader = params.get("showHeader");
  }

  ngOnInit(): void {
    this.filterItems();
  }

  filterItems() {
    this.filteredItems = this.searchItems.filter(obj =>
      this.query == "" || obj.label.toLowerCase().indexOf(this.query.toLowerCase()) != -1);
  }

  headerFn(record: SelectItem, recordIndex: number, records: SelectItem[]) {
    if (recordIndex == 0 || (records[recordIndex-1] && record.label[0] != records[recordIndex-1].label[0])) {
      return record.label ? record.label[0] : null;
    }
    return null;
  }

  dismiss(value?:string) {
    this.viewCtrl.dismiss(value);
  }
}
