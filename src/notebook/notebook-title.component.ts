import { Component, Input } from "@angular/core";
import { Notebook } from "./notebook.spec";
@Component({
  selector: "filterize-notebook-title",
  template: `
    <strong *ngIf="notebook.stack">{{ notebook.stack }}:</strong>
    {{ notebook.name }}
    <br *ngIf="linebreak && notebook.contact_label">
    <small *ngIf="notebook.contact_label">({{ notebook.contact_label }})</small>
  `
})
export class NotebookTitleComponent {
  @Input() linebreak = false;
  @Input() notebook: Notebook;
}
