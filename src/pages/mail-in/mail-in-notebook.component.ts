import { Component, Input } from "@angular/core";
@Component({
  selector: "filterize-mailin-notebook",
  template: `
      <filterize-notebook-title [notebook]="notebook"></filterize-notebook-title>
  `
})
export class MailinNotebookComponent {
  @Input() user;
  @Input() notebook;
  @Input() business:boolean;
}
