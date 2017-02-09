import { Pipe, PipeTransform } from "@angular/core";
import { i18n_dict } from "./tools.spec";
import { TranslateService } from "ng2-translate";
import { FilterizeTranslateService } from "./filterize-translate.service";


@Pipe({name: "filterize_translate"})
export class FilterizeTranslatePipe implements PipeTransform {
  constructor(private trans: FilterizeTranslateService) {}

  transform(value?: string | i18n_dict): string {
    return this.trans.translate(value);
  }

}
