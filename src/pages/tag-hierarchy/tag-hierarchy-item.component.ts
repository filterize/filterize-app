import { Component, Input } from "@angular/core";
import { Store } from "@ngrx/store";
import { AppState } from "../../app/appstate";
import { Observable } from "rxjs";
import { TagHierarchyElement, Tag } from "../../tags/tags.spec";
import { USER_RESOURCES } from "../../filterize-ressources/resources.list";

@Component({
  selector: "filterize-tag-hierarchy-item",
  template: `
    <ion-item *ngIf="element.tag">
      <ion-label (click)="collapse = !collapse">
        <span [innerHTML]="space"></span>
        <ion-icon name="arrow-dropright" *ngIf="collapse && element.children.length > 0"></ion-icon>
        <ion-icon name="arrow-dropdown" *ngIf="!collapse && element.children.length > 0"></ion-icon>
        {{ element.tag.name }}
       </ion-label>
       <ion-toggle 
       *ngIf="element.children.length > 0" 
       [checked]="element.tag.active"
       (ionChange)="clickToggle($event.checked)"></ion-toggle>
    </ion-item>
    <filterize-tag-hierarchy-item 
      *ngFor="let elem of (collapse ? [] : element.children)" 
      [element]="elem"
      [level]="level + 1">
    </filterize-tag-hierarchy-item>
  `,
})
export class TagHierarchyItemComponent {
  @Input() element: TagHierarchyElement;
  @Input() level: number = -1;
  @Input() collapse: boolean = true;
  space: string = "";

  constructor(private store: Store<AppState>) {}

  ngOnInit() {
    this.space = "&nbsp;&nbsp;&nbsp;".repeat(Math.max(0, this.level));
  }

  clickToggle(state) {
    this.store.dispatch({
      type: `${USER_RESOURCES.tag.action_prefix}_CHANGED`,
      payload: {
        _id: this.element.tag._id,
        active: state
      }
    })
  }
}
