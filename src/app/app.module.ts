import { IonicApp, IonicModule } from "ionic-angular";
import { NgModule, ErrorHandler } from "@angular/core";
import { StoreModule } from "@ngrx/store";
import { routerReducer } from "@ngrx/router-store";
import { EffectsModule } from "@ngrx/effects";
import { StoreDevtoolsModule } from "@ngrx/store-devtools";
import { CONFIG } from "./config";
import { MyApp } from "./app.component";
import { LoginComponent } from "../pages/login/login.component";
import { HomePage } from "../pages/home/home";
import { HomePage2 } from "../pages/home2/home2";
import { LoginSignupComponent } from "../pages/login/login-signup.component";
import { AnalyticsEffects } from "../effects/analytics.effects";
import { AnalyticsService } from "../services/analytics.service";
import { TranslateModule, TranslateLoader } from "ng2-translate";
import { createTranslateLoader } from "./translation-loader";
import { Http } from "@angular/http";
import { SignupComponent } from "../pages/login/signup.component";
import { UserEffects } from "../user/user.effects";
import { userlistReducer } from "../user/userlist.reducers";
import { DbGlobalService } from "../services/db-global.service";
import { SideMenuComponent } from "../pages/side-menu/side-menu.component";
import { UserButtonComponent } from "../user/user-button.component";
import { currentUserReducer } from "../user/current-user.reducer";
import { UserService } from "../services/user.service";
import { UserSelectComponent } from "../user/user-select.component";
import * as Raven from 'raven-js';
import { RavenService } from "../services/raven.service";
import { DbUserService } from "../services/db-user.service";
import { MamaMenuExpose } from "../mama-menu-expose/mama-menu-expose.component";
import { ResourcesService } from "../filterize-ressources/resources.service";
import { globalReducer } from "../filterize-ressources/globals.reducer";
import { settingsReducer } from "../settings/settings.reducer";
import { userResourceReducerAddOn } from "../filterize-ressources/combined-user-resources.reducer";
import { TagHierarchyComponent } from "../pages/tag-hierarchy/tag-hierarchy.component"
import { TagHierarchyItemComponent } from "../pages/tag-hierarchy/tag-hierarchy-item.component";

/*const appRoutes = [
  {path: "login/login", component: LoginComponent, name: "Login"},
  {path: "home2", component: HomePage2, name: "Home2"},
  {path: "**", component: HomePage, name: "Home"}
];*/

Raven
  .config(CONFIG.raven.uri, {
    release: CONFIG.version,
    environment: CONFIG.version.indexOf("-") === -1 ? "live" : "development"
  })
  .install();

class RavenErrorHandler implements ErrorHandler {
  handleError(err:any) : void {
    Raven.captureException(err.originalError);
  }
}

let imports = [
  IonicModule.forRoot(MyApp, {}, {
    links: [
      { component: HomePage, name: 'Home', segment: 'home' },
      { component: LoginComponent, name: 'Login', segment: 'login' },
      { component: SignupComponent, name: 'SignUp', segment: 'signup' },
    ]
  }),
  // RouterModule.forRoot(appRoutes),
  StoreModule.provideStore(Object.assign({
    router: routerReducer,
    userlist: userlistReducer,
    current_user: currentUserReducer,
    globals: globalReducer,
    settings: settingsReducer
  }, userResourceReducerAddOn)),
  // RouterStoreModule.connectRouter(),
  EffectsModule.runAfterBootstrap(AnalyticsEffects),
  EffectsModule.runAfterBootstrap(AnalyticsService),
  EffectsModule.runAfterBootstrap(UserEffects),
  EffectsModule.runAfterBootstrap(DbGlobalService),
  EffectsModule.runAfterBootstrap(DbUserService),
  EffectsModule.runAfterBootstrap(ResourcesService),
  EffectsModule.runAfterBootstrap(RavenService),
  TranslateModule.forRoot({
    provide: TranslateLoader,
    useFactory: (createTranslateLoader),
    deps: [Http],
  })
];


if (CONFIG.production) {
  // Code only for production environment
} else {
  // Code only for debug environment
  imports.push(StoreDevtoolsModule.instrumentOnlyWithExtension())
}

@NgModule({
  declarations: [
    MyApp,
    SideMenuComponent,
    HomePage,
    HomePage2,
    LoginComponent,
    LoginSignupComponent,
    SignupComponent,
    UserButtonComponent,
    UserSelectComponent,
    MamaMenuExpose,
    TagHierarchyComponent,
    TagHierarchyItemComponent
  ],
  imports: imports,
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    SideMenuComponent,
    LoginSignupComponent,
    SignupComponent,
    LoginComponent,
    UserSelectComponent,
    TagHierarchyComponent,
  ],
  providers: [
    { provide: ErrorHandler, useClass: RavenErrorHandler },
    AnalyticsService,
    DbGlobalService,
    DbUserService,
    UserService,
    ResourcesService
  ]
})
export class AppModule {
}
