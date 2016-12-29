import { IonicApp, IonicModule } from "ionic-angular";
import { NgModule } from "@angular/core";
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

/*const appRoutes = [
  {path: "login/login", component: LoginComponent, name: "Login"},
  {path: "home2", component: HomePage2, name: "Home2"},
  {path: "**", component: HomePage, name: "Home"}
];*/

let imports = [
  IonicModule.forRoot(MyApp),
  // RouterModule.forRoot(appRoutes),
  StoreModule.provideStore({router: routerReducer}),
  // RouterStoreModule.connectRouter(),
  EffectsModule.runAfterBootstrap(AnalyticsEffects),
  EffectsModule.runAfterBootstrap(UserEffects),
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
    HomePage,
    HomePage2,
    LoginComponent,
    LoginSignupComponent,
    SignupComponent,
  ],
  imports: imports,
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    //HomePage
    LoginSignupComponent,
    SignupComponent,
    LoginComponent,
  ],
  providers: [
    AnalyticsService,
  ]
})
export class AppModule {
}
