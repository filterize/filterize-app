import { Component } from '@angular/core';
import { Platform, Nav, NavController } from 'ionic-angular';
import { StatusBar, Splashscreen, Deeplinks } from 'ionic-native';
import { Store } from '@ngrx/store'

import { HomePage } from '../pages/home/home';
import { HomePage2 } from '../pages/home2/home2';

import { ViewChild } from '@angular/core';
import { AnalyticsService } from '../services/analytics.service'
import { LoginSignupComponent } from "../pages/login/login-signup.component";
import { TranslateService } from "ng2-translate";
import { DbGlobalService } from "../services/db-global.service";
import { SideMenuComponent } from "../pages/side-menu/side-menu.component";


@Component({
  template: `
    <filterize-side-menu [content]="content"></filterize-side-menu>
    <ion-nav #content [root]="rootPage"></ion-nav>
  `
})
export class MyApp {
  rootPage = LoginSignupComponent;
  @ViewChild(Nav) navChild: Nav;

  constructor(platform: Platform, private translate: TranslateService, private dbGlobal: DbGlobalService) {
    translate.setDefaultLang("en");
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();
      Splashscreen.hide();

      Deeplinks.routeWithNavController(this.navChild, {
        '/home2': HomePage2,
      }).subscribe((match) => {
        console.log('Successfully routed', match);
      }, (nomatch) => {
        console.warn('Unmatched Route', nomatch);
      });
    });

  }
}
