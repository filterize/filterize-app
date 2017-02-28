import { Component, Input, EventEmitter, Output } from '@angular/core';

@Component({
  selector: "filterize-user-button",
  template: `
    <button ion-item>
      <ion-icon name="person"></ion-icon> &nbsp;
      {{ user.realname }}
      <small dark *ngIf="user.username">({{ user.username }})</small>
      <small dark *ngIf="user.consultant">[{{ "UI.VIA" | translate }} {{ user.consultant }}]</small>
    </button>
  `
})
export class UserButtonComponent {
  @Input() user;
}
