import { Component, Input } from "@angular/core";
@Component({
  selector: "filterize-mailin-notebook",
  template: `
  <ion-item>
    <ion-button block (click)="collapsed = !collapsed">
      <ion-icon name="arrow-dropright" *ngIf="collapsed"></ion-icon>
      <ion-icon name="arrow-dropdown" *ngIf="!collapsed"></ion-icon>
      <filterize-notebook-title [notebook]="notebook"></filterize-notebook-title>
    </ion-button>
    <br>
    <strong *ngIf="!collapsed">
      &nbsp;&nbsp;&nbsp;<a [href]="address_link">{{ address }}</a>
    </strong>
  </ion-item>
  `
})
export class MailinNotebookComponent {
  @Input() user;
  @Input() notebook;
  @Input() business:boolean;
  collapsed = true;
  address: string;
  address_link: string;

  ngOnChanges(map) {
    if (this.user && this.notebook) {
      let guid_prefix = this.notebook.guid.split("-").slice(-1)[0];
      let business_prefix = this.business ? "b_" : "";
      let token_suffix = this.user.mailin_require_token ? `+${this.user.mailin_token}` : "";
      this.address = `${business_prefix}nb+${guid_prefix}${token_suffix}@${this.user.username}.u.filterize.net`;
      this.address_link = `mailto:${this.address}`;
      console.log(this.address_link);
    } else {
      this.address = "";
      this.address_link = "";
    }
  }

}
