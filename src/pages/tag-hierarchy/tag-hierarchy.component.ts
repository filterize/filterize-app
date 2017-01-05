import { Component } from "@angular/core";
import { Store } from "@ngrx/store";
import { AppState } from "../../app/appstate";
import { Observable } from "rxjs";
import { TagHierarchyElement, Tag } from "../../tags/tags.spec";

@Component({
  template: `
    <ion-header>
      <ion-navbar>
        <button ion-button icon-only menuToggle>
          <ion-icon name="menu"></ion-icon>
        </button>
    
        <ion-title>
          {{ "HIERARCHY.TITLE" | translate }}
        </ion-title>
      </ion-navbar>
    </ion-header>
    
    <ion-content padding>
    
      {{ "HIERARCHY.DESC" | translate}}
      <ion-list>
        <filterize-tag-hierarchy-item [element]="tags$ | async" [collapse]="false" ></filterize-tag-hierarchy-item>
      </ion-list>
    
    </ion-content>
  `,
})
export class TagHierarchyComponent {
  tags$ : Observable<TagHierarchyElement>;

  constructor(private store: Store<AppState>) {}

  ngOnInit() {
    this.tags$ = this.store.select("tags")
      .map((data:Tag[]) => {
        let metaObj = Object();
        for (let tag of data) {
          metaObj[tag.guid] = {tag: tag, children: []};
        }
        for (let guid in metaObj) {
          let tag: TagHierarchyElement = metaObj[guid];
          if (tag.tag.parentGuid in metaObj) {
            metaObj[tag.tag.parentGuid].children.push(tag)
          }
        }
        let sorter = (a: TagHierarchyElement, b: TagHierarchyElement) =>
          a.tag.name < b.tag.name ? -1 : 1;
        let root = {tag: null, children: []};
        for (let guid in metaObj) {
          let tag: TagHierarchyElement = metaObj[guid];
          tag.children.sort(sorter);
          if (tag.tag.parentGuid == null) {
            root.children.push(tag);
          }
        }
        root.children.sort(sorter);
        return root;
      });
    this.tags$.subscribe(data => console.log(data));
  }
}
