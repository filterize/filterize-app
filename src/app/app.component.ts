import { Component } from '@angular/core';
import { Platform, Nav, NavController, App, IonicApp, MenuController } from 'ionic-angular';
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
import { LoginComponent } from "../pages/login/login.component";
import {Network} from "ionic-native";


@Component({
  template: `
    <filterize-side-menu [content]="content" (goto)="rootPage=$event"></filterize-side-menu>
    <ion-nav #content [root]="rootPage"></ion-nav>
  `
})
export class MyApp {
  rootPage = HomePage;
  @ViewChild(Nav) navChild: Nav;

  constructor(platform: Platform,
              private translate: TranslateService,
              private dbGlobal: DbGlobalService,
              private app: App,
              private ionicApp: IonicApp,
              private menuCtrl: MenuController) {
    translate.setDefaultLang("en");
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();
      Splashscreen.hide();
      console.log("connection", <string> Network.type)


    });
    // this.setupBackButtonBehavior();


  }

  // https://gist.github.com/t00ts/3542ac4573ffbc73745641fa269326b8
  private setupBackButtonBehavior() {

    // If on web version (browser)
    if (window.location.protocol !== "file:") {

      // Register browser back button action(s)
      window.onpopstate = (evt) => {

        // Close menu if open
        if (this.menuCtrl.isOpen()) {
          this.menuCtrl.close();
          return;
        }

        // Close any active modals or overlays
        let activePortal = this.ionicApp._loadingPortal.getActive() ||
          this.ionicApp._modalPortal.getActive() ||
          this.ionicApp._toastPortal.getActive() ||
          this.ionicApp._overlayPortal.getActive();

        if (activePortal) {
          activePortal.dismiss();
          return;
        }

        // Navigate back
        if (this.app.getRootNav().canGoBack()) this.app.getRootNav().pop();

      };

      // Fake browser history on each view enter
      this.app.viewDidEnter.subscribe((app) => {
        history.pushState(null, null, "");
      });

    }

  }
}
