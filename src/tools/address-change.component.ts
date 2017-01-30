import { Component, Input, OnChanges, OnInit, SimpleChanges } from "@angular/core";
import { NavParams, ViewController } from "ionic-angular";
import { Observable } from "rxjs";
import { CountryService } from "../services/country.service";
import { SelectItem } from "./search-select.spec";

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
          <ion-icon name="person"></ion-icon>
          {{ "ADDRESS.CHANGE" | translate }}
        </ion-title>
        <ion-buttons right>
          <button ion-button icon-only (click)="dismiss(data)">
            <ion-icon name="checkmark"></ion-icon>
          </button>
        </ion-buttons>
      </ion-navbar>
    </ion-header>
    
    <ion-content>  
     
      <ion-list>
        <ion-item *ngFor="let field of FIELDS_NO_SELECT">
          <ion-label floating>{{ "ADDRESS."+field | uppercase | translate }}</ion-label>
          <ion-input type="text" [(ngModel)]="data[field]"></ion-input>
        </ion-item>
        
        <filterize-select 
          title="{{ 'ADDRESS.STATE' | translate }}"
          [searchItems]="states"
          [(value)]="data.state"
          >
        </filterize-select>
        
        <filterize-select 
          title="{{ 'ADDRESS.COUNTRY' | translate }}"
          [searchItems]="countries$ | async"
          [(value)]="data.country"
          (valueChange)="updateStates($event)"
          >
        </filterize-select>
      
      </ion-list>
      
    </ion-content>
  `
})
export class AddressChangeComponent implements OnInit {
  FIELDS = [
    "company",
    "first_name",
    "last_name",
    "address",
    "address_extra",
    "zip_code",
    "state",
    "country"
  ];
  FIELDS_NO_SELECT = this.FIELDS.filter(obj => (obj != "state" && obj != "country"));
  obj = null;
  show_company: boolean = false;

  countries$: Observable<SelectItem[]>;

  data = {};
  states = {};


  constructor(private params: NavParams, private countrySrv: CountryService, private viewCtrl: ViewController) {
    this.obj = params.get("obj");
    this.show_company = !!params.get("show_company");
    this.countries$ = this.countrySrv.getCountryObservable();

  }

  ngOnInit(): void {
    if (this.obj) {
      this.data = {};
      for (let key of this.FIELDS) {
        this.data[key] = this.obj[key];
      }
    }
    console.log(this.obj, this.data);
    this.updateStates();
  }

  updateStates() {
    if (!this.data["state"] || !this.data["state"].startsWith(this.data["country"])) {
      this.data["state"] = "";
    }
    this.countrySrv.getStates(this.data["country"])
      .first()
      .subscribe(obj => {
        console.log("states-pre", obj);
        this.states = obj.map(s => Object({value: s["code"], label: s["name"]}));
        console.log("states:", this.states)
      });
  }

  dismiss(data?) {
    this.viewCtrl.dismiss(data)
  }

}
