import { Component, Input, OnChanges, OnInit, SimpleChanges } from "@angular/core";
import { NavParams } from "ionic-angular";

@Component({
  template: `
    <ion-header>
      <ion-navbar>
        
        <ion-title>
          <ion-icon name="person"></ion-icon>
          {{ "ADDRESS.CHANGE" | translate }}
        </ion-title>
      </ion-navbar>
    </ion-header>
    
    <ion-content>  
     
      <ion-list>
        <ion-item *ngFor="let field of FIELDS">
          <ion-label floating>{{ "ADDRESS."+field | uppercase | translate }}</ion-label>
          <ion-input type="text" [(ngModel)]="data[field]"></ion-input>
        </ion-item>
      
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
  obj = null;
  show_company: boolean = false;

  data = {};

  constructor(private params: NavParams) {
    this.obj = params.get("obj");
    this.show_company = !!params.get("show_company");
  }

  ngOnInit(): void {
    if (this.obj) {
      this.data = {};
      for (let key of this.FIELDS) {
        this.data[key] = this.obj[key];
      }
    }
    console.log(this.obj, this.data);
  }

}
