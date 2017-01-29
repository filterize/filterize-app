import { Injectable } from "@angular/core";
import { Store } from "@ngrx/store";
import { AppState } from "../app/appstate";
import { Observable } from "rxjs";
import { SelectItem } from "../tools/search-select.spec";
@Injectable()
export class CountryService {
  country_devisions$;
  countries$;

  constructor(private store: Store<AppState>) {
    this.country_devisions$ = store.select("globals")
      .map(globals => globals["country_devisions"])
      .distinctUntilChanged();
    this.countries$ = store.select("globals")
      .map(globals => globals["countries"])
      .distinctUntilChanged();
  }

  get_state(code: string): Observable<string> {
    return this.country_devisions$
      .map(cd => {
        let country = code ? code.split("-")[0] : "";
        if (cd[country] && cd[country].find) {
          let dev = cd[country].find(obj => obj["code"] == code);
          if (dev) {
            return dev["name"];
          }
        }
        return code;
      });
  }

  get_country(code: string): Observable<string> {
    return this.countries$
      .map(c => c[code] ? c[code] : code);
  }

  getCountryObservable() {
    return this.countries$;
  }

  getStates(country: string) {
    return this.country_devisions$.map(obj => country in obj ? obj[country] : {});
  }

}
