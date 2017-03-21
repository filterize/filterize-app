import { Pipe, PipeTransform } from "@angular/core";
import * as strftime from "strftime";
import { Store } from "@ngrx/store";
import { AppState } from "../app/appstate";

@Pipe({name: "filterize_date"})
export class CustomDatePipe implements PipeTransform {
  codes = {
    "date": "%Y-%m-%d",
    "date-time": "%Y-%m-%d %H:%M",
    "time": "%H:%M"
  };

  LANG_MAP = {
    "en": "en_US",
    "de": "de_DE",
    "es": "es_MX",
    "fr": "fr_FR",
    "it": "it_IT",
    "nl": "nl_NL",
    "pt": "pt_BR",
    "ru": "ru_RU",
    "tr": "tr_TR",
    "zh": "zh_CN"
  };

  strftimeLocal = strftime;

  constructor(private store:Store<AppState>) {
    this.store.select("settings")
      .filter(settings => settings != null)
      .subscribe(settings => {
        this.codes["date"] = settings["date_format"] || "%Y-%m-%d";
        this.codes["time"] = settings["time_format"] || "%H:%M";
        this.codes["date-time"] = `${this.codes["date"]} ${this.codes["time"]}`;
        let code = this.LANG_MAP[settings["language"]] || "en_US";
        this.strftimeLocal = strftime.localizeByIdentifier(code);
      })
  }

  transform(value: any, format_code: string): string {
    let date = new Date(value);
    if (this.codes[format_code]) {
      return this.strftimeLocal(this.codes[format_code], date);
    }
    else {
      return this.strftimeLocal(format_code, date);
    }
  }

}
