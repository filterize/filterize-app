import { IonicApp, IonicModule } from "ionic-angular";
import { NgModule, ErrorHandler, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
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
import * as Raven from "raven-js";
import { RavenService } from "../services/raven.service";
import { DbUserService } from "../services/db-user.service";
import { MamaMenuExpose } from "../mama-menu-expose/mama-menu-expose.component";
import { ResourcesService } from "../filterize-ressources/resources.service";
import { globalReducer } from "../filterize-ressources/globals.reducer";
import { settingsReducer } from "../settings/settings.reducer";
import { userResourceReducerAddOn } from "../filterize-ressources/combined-user-resources.reducer";
import { TagHierarchyComponent } from "../pages/tag-hierarchy/tag-hierarchy.component";
import { TagHierarchyItemComponent } from "../pages/tag-hierarchy/tag-hierarchy-item.component";
import { TbdComponent } from "./tbd.component";
import { DashboardComponent } from "../pages/dashboard/dashboard.component";
import { FilterComponent } from "../pages/filter/filter.component";
import { CalendarComponent } from "../pages/calendar/calendar.component";
import { LibraryComponent } from "../pages/library/library.component";
import { MailInComponent } from "../pages/mail-in/mail-in.component";
import { PaymentComponent } from "../pages/payment/payment.component";
import { SettingsComponent } from "../pages/settings/settings.component";
import { NotebookTitleComponent } from "../notebook/notebook-title.component";
import { CalendarDetailsComponent } from "../pages/calendar/calendar-details.component";
import { ZendeskService } from "../services/zendesk.service";
import { MailinNotebookComponent } from "../pages/mail-in/mail-in-notebook.component";
import { FixedSizeIconComponent } from "./fixed-icon.component";
import { CountryService } from "../services/country.service";
import { AddressComponent } from "../tools/address.component";
import { ConfigService } from "../services/config.service";
import { CustomDatePipe } from "../tools/customdate.pipe";
import { AddressChangeComponent } from "../tools/address-change.component";
import { SearchSelectModalComponent } from "../tools/search-select-modal.component";
import { SearchSelectComponent } from "../tools/search-select.component";
import { FilterGroupsComponent } from "../pages/filter/filter-groups.component";
import { FilterStacksComponent } from "../pages/filter/filter-stacks.component";
import { FilterListComponent } from "../pages/filter/filter-list.component";
import { FilterService } from "../filter/filter.service";
import { ActionItemComponent } from "../pages/filter/action-item.component";
import { ConditionItemComponent } from "../pages/filter/condition-item.component";
import { FilterizeTranslatePipe } from "../tools/filterize-translate.pipe";
import { FilterizeTranslateService } from "../tools/filterize-translate.service";
import { ConditionActionEditComponent } from "../pages/filter/condition-action-edit.component";
import { ConditionActionFieldComponent } from "../pages/filter/condition-action-field.component";
import { ConditionActionSelectComponent } from "../pages/filter/condition-action-select.component";
import { ConsultantComponent } from "../pages/consultant/consultant.component";
import { GoogleLoginService } from "../services/google.login.service";
import { EvernoteService } from "../services/evernote.service";


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
  IonicModule.forRoot(MyApp, {}
  , {
    links: [
      //{ component: MyApp, name: 'Filterize', segment: 'm' },
      { component: HomePage, name: 'Home', segment: 'home' },
      { component: LoginComponent, name: 'Login', segment: 'login' },
      { component: SignupComponent, name: 'Sign-Up', segment: 'sign-up' },
      { component: UserSelectComponent, name: 'Select', segment: 'select-user' },
      { component: TagHierarchyComponent, name: 'Tag Hierarchy', segment: 'tag-hierarchy' },
      { component: DashboardComponent, name: 'Dashboard', segment: 'dashboard' },
      { component: FilterGroupsComponent, name: 'Filter', segment: 'filter' },
      { component: FilterStacksComponent, name: 'Filter Stacks', segment: 'filter/:profile/:business/:group',
        defaultHistory: [FilterGroupsComponent]},
      { component: FilterListComponent, name: 'Filter', segment: 'filter/:profile/:business/:group/:stack',
        defaultHistory: [FilterGroupsComponent, FilterStacksComponent]},
      { component: FilterComponent, name: 'Filter Details', segment: 'filter/:profile/:business/:group/:stack/:guid',
        defaultHistory: [FilterGroupsComponent, FilterStacksComponent, FilterListComponent]},
      { component: CalendarComponent, name: 'Calendar', segment: 'calendar' },
      { component: CalendarDetailsComponent, name: 'Calendar Details', segment: 'calendar/:profile/:business/:guid',
        defaultHistory: [CalendarComponent]},
      { component: LibraryComponent, name: 'Library', segment: 'library' },
      { component: MailInComponent, name: 'Mail-In', segment: 'mail-in' },
      { component: PaymentComponent, name: 'Payment', segment: 'payment' },
      { component: SettingsComponent, name: 'Settings', segment: 'settings' },
    ]
  }
  ),
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
    TagHierarchyItemComponent,
    TbdComponent,
    DashboardComponent,
    FilterComponent,
    CalendarComponent,
    LibraryComponent,
    MailInComponent,
    PaymentComponent,
    SettingsComponent,
    NotebookTitleComponent,
    CalendarDetailsComponent,
    MailinNotebookComponent,
    FixedSizeIconComponent,
    AddressComponent,
    CustomDatePipe,
    FilterizeTranslatePipe,
    AddressChangeComponent,
    SearchSelectModalComponent,
    SearchSelectComponent,
    FilterGroupsComponent,
    FilterStacksComponent,
    FilterListComponent,
    ActionItemComponent,
    ConditionItemComponent,
    ConditionActionEditComponent,
    ConditionActionFieldComponent,
    ConditionActionSelectComponent,
    ConsultantComponent
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
    DashboardComponent,
    FilterComponent,
    CalendarComponent,
    LibraryComponent,
    MailInComponent,
    PaymentComponent,
    SettingsComponent,
    CalendarDetailsComponent,
    AddressChangeComponent,
    SearchSelectModalComponent,
    SearchSelectComponent,
    FilterGroupsComponent,
    FilterStacksComponent,
    FilterListComponent,
    ConditionActionEditComponent,
    ConditionActionSelectComponent,
    ConsultantComponent
  ],
  providers: [
    { provide: ErrorHandler, useClass: RavenErrorHandler },
    AnalyticsService,
    DbGlobalService,
    DbUserService,
    UserService,
    ResourcesService,
    ZendeskService,
    FilterizeTranslateService,
    CountryService,
    ConfigService,
    FilterService,
    GoogleLoginService,
    EvernoteService
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class AppModule {
}
