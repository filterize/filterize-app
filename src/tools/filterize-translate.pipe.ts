import { Pipe, PipeTransform } from "@angular/core";
import { i18n_dict } from "./tools.spec";
import { TranslateService } from "ng2-translate";

@Pipe({name: "filterize_translate"})
export class FilterizeTranslatePipe implements PipeTransform {
  constructor(private trans: TranslateService) {}

  transform(value?: string | i18n_dict): string {
    console.log("translate", value);
    if (value == null) {
      return "";
    }
    if (typeof value == "string") {
      return value;
    }
    let languages = [
      this.trans.currentLang,
      this.trans.getDefaultLang(),
      "default"
    ];
    console.log(languages);
    for (let lang of languages) {
      if (lang == null) {
        continue;
      }
      if (value[lang] != null) {
        return value[lang];
      }
    }
    return "";
  }

}
