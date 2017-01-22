import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store'
import * as UserActions from "../../user/user.actions";
import { Actions } from "@ngrx/effects";
import { AlertController } from "ionic-angular";
import { TranslateService } from "ng2-translate";
import { Observable, Subscription } from "rxjs";
import { AppState } from "../app/appstate";
import { UserService } from "../services/user.service";
import { CountryService } from "../services/country.service";


@Component({
  selector: "filterize-address",
  template: `
    {{ obj?.company }}<br *ngIf="obj?.company">
    {{ obj?.first_name }} {{ obj?.last_name }}
    <br *ngIf="obj?.address">{{ obj?.address }}
    <br *ngIf="obj?.address_extra">{{ obj?.address_extra }}
    <br *ngIf="obj?.zip_code || obj?.city">{{ obj?.zip_code }} {{ obj?.city }}
    <br *ngIf="state | async">{{ state | async }}
    <br *ngIf="country | async">{{ country | async }}

  `
})
export class AddressComponent {
  @Input() obj: any;
  state: Observable<string>;
  country: Observable<string>;

  constructor(private countrySrv: CountryService,
              private translate: TranslateService) {
  }

  ngOnInit() {
    this.state = this.countrySrv.get_state(this.obj ? this.obj.state : "");
    this.country = this.countrySrv.get_country(this.obj ? this.obj.country : "");
  }

}
