import { Pipe, PipeTransform } from "@angular/core";
import * as strftime from "strftime";

@Pipe({name: "filterize_date"})
export class CustomDatePipe implements PipeTransform {
  codes = {
    "date": "%Y-%m-%d",
    "date-time": "%Y-%m-%d %H:%M",
    "time": "%H:%M"
  };

  transform(value: any, format_code: string): string {
    let date = new Date(value);
    return strftime(this.codes[format_code], date);

  }

}
