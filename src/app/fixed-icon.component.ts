import { Component, Input } from "@angular/core";
@Component({
  selector: "filterize-fixed-size-icon",
  template: `<span><ion-icon [name]="name"></ion-icon></span>`,
  styles: [`
    span {
      min-width: 2rem;
      text-align: center;
    }
  `]

})
export class FixedSizeIconComponent {
  @Input() name: string;
}
