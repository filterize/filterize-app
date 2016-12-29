import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';

@Component({
  selector: 'page-home-alt',
  template: `
    hello world <br>
    <a routerLink="/" routerLinkActive="active">home</a>
  `
})
export class HomePage2 {

  constructor() {

  }

}
