import { Component, Input } from '@angular/core';
import { CONFIG } from "./config";

let FEATURES = [
  "calendar",
  "mail-in",
  "dashboard",
  "filter",
  "dashboard",
  "settings",
  "payment",
  "library"
];

@Component({
  selector: "filterize-tbd",
  template: `
    <span style="color: red">This feature is not implemented yet. It's scheduled for {{getTarget(feature)}}.</span>
    <small>(Current is {{current_version}})</small>
  `
})
export class TbdComponent {
  current_version: string;
  default_version: string;
  features = Object();

  constructor() {
    this.current_version = CONFIG.version;
    let version_parts = this.current_version.split(".")
    let x = parseInt(version_parts[0]);
    let y = parseInt(version_parts[1]);
    this.default_version = `${x+1}.0.0`;
    let i = 1;
    for (let f of FEATURES) {
      this.features[f] = `${x}.${y+i}.0`;
      i = i + 1;
    }
  }

  @Input() feature: string;

  getTarget(feature) {
    if (feature in this.features) {
      return this.features[feature];
    }
    return this.default_version;
  }
}
