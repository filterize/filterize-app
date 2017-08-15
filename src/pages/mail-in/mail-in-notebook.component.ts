import { Component, Input } from "@angular/core";
@Component({
  selector: "filterize-mailin-notebook",
  template: `
  <ion-item class="selectable">
    <ion-button block (click)="collapsed = !collapsed" class="unselectable">
      <ion-icon name="arrow-dropright" *ngIf="collapsed"></ion-icon>
      <ion-icon name="arrow-dropdown" *ngIf="!collapsed"></ion-icon>
      <filterize-notebook-title [notebook]="notebook"></filterize-notebook-title>
    </ion-button>
    <br>
    <strong *ngIf="!collapsed">
      <a class="selectable" [href]="address_link" *ngIf="!req_sync">{{ address }}</a>
      <ion-label color="danger" [href]="address_link" *ngIf="req_sync">{{ "MAIL_IN.SYNC_FIRST" | translate }}</ion-label>
    </strong>
  </ion-item>
  `,
  styles: [`
    .selectable {user-select: text !important;}
    .unselectable {user-select: none;}
  `]
})
export class MailinNotebookComponent {
  @Input() user;
  @Input() notebook;
  @Input() business:boolean;
  collapsed = true;
  address: string;
  address_link: string;
  req_sync = false;

  ngOnChanges(map) {
    if (this.user && this.notebook) {
      let guid_prefix = this.notebook.guid.split("-").slice(-1)[0];
      let business_prefix = this.business ? "b_" : "";
      let token_suffix = this.user.mailin_require_token ? `+${this.user.mailin_token}` : "";
      this.req_sync = (this.user.mailin_require_token  && (!this.user.mailin_token));
      this.address = `${business_prefix}nb+${guid_prefix}${token_suffix}@${this.user.username}.u.filterize.net`;
      this.address_link = `mailto:${this.address}`;
      // console.log(this.address_link);
    } else {
      this.address = "";
      this.address_link = "";
    }
  }

}
