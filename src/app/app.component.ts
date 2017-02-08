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
import { AppState } from "./appstate";
import { Actions } from "@ngrx/effects";
import * as UserActions from "../user/user.actions";
import { TagHierarchyComponent } from "../pages/tag-hierarchy/tag-hierarchy.component";
import { ZendeskService } from "../services/zendesk.service";


@Component({
  template: `
    <filterize-side-menu [content]="content" (goto)="nav.push($event)"></filterize-side-menu>
    <ion-nav #content [root]="rootPage"></ion-nav>
    
  `
})
export class MyApp {
  user_start = HomePage;
  login_start = LoginSignupComponent;
  rootPage = this.user_start;
  @ViewChild(Nav) navChild: Nav;

  constructor(platform: Platform,
              private translate: TranslateService,
              private dbGlobal: DbGlobalService,
              private app: App,
              private ionicApp: IonicApp,
              private menuCtrl: MenuController,
              private store: Store<AppState>,
              private actions$: Actions,
              private zendeskSrv: ZendeskService) {
    translate.setDefaultLang("en");
    translate.resetLang("en");
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();
      Splashscreen.hide();
      console.log("connection", <string> Network.type)

      /*
      Deeplinks.routeWithNavController(this.navChild, {
        '/login': LoginSignupComponent,
        '/tag-hierarchy': TagHierarchyComponent
      }); */

    });
    // this.setupBackButtonBehavior();
  }

  ngOnInit() {
    this.store.select("current_user").take(1).subscribe(data => {
      if (data["profile"] == "") this.navChild.setRoot(this.login_start);
    });

    let goHome = () => this.navChild.setRoot(this.user_start);

    this.actions$.ofType(UserActions.SELECT).subscribe(goHome);
    this.actions$.ofType(UserActions.LOGIN_SUCCESS).subscribe(goHome);
    this.actions$.ofType(UserActions.LOGOUT).subscribe(() => this.navChild.setRoot(this.login_start));

    this.navChild.viewDidEnter.subscribe(() => this.zendeskSrv.updatePath());
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
