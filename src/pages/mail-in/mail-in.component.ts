import { Component } from '@angular/core';
import { Store } from '@ngrx/store'
import { AppState } from "../../app/appstate";
import * as UserActions from "../../user/user.actions";
import { Actions } from "@ngrx/effects";
import { AlertController } from "ionic-angular";
import { TranslateService } from "ng2-translate";
import { UserService } from "../../services/user.service";
import { Subscription, Observable } from "rxjs";
import { Notebook } from "../../notebook/notebook.spec";
import { ResourcesService } from "../../filterize-ressources/resources.service";


@Component({
  template: `
    <ion-header>
      <ion-navbar>
        
        <button ion-button icon-only menuToggle>
          <ion-icon name="menu"></ion-icon>
        </button>
    
        <ion-title>
          <ion-icon name="mail"></ion-icon>
          {{ "MAIL_IN.TITLE" | translate }}
        </ion-title>
      </ion-navbar>
    </ion-header>
    
    <ion-content padding>  
      <ion-list>
        <ion-button ion-item *ngIf="!has_address" (click)="changeAddress()">
          {{ "MAIL_IN.INTRO" | translate }}
        </ion-button>
        <ion-button ion-item *ngIf="has_address" (click)="changeAddress()">
          {{ (current_user$ | async)?.mailin_address }}
        </ion-button>
        <ion-item>
          <ion-label>{{ "MAIL_IN.REQUIRE_TOKEN" | translate }}</ion-label>
          <ion-toggle 
            [disabled]="!has_address"
            (ionChange)="toggleToken($event)"
            [ngModel]="require_token"></ion-toggle>
        </ion-item>
        <ion-button ion-item outline *ngIf="require_token" color="danger" >
          {{ "MAIL_IN.RESET_TOKEN" | translate}}
        </ion-button>
        <filterize-mailin-notebook 
          *ngFor="let nb of (notebooks$|async)" 
          [notebook]="nb" [user]="current_user" [business]="business">
        </filterize-mailin-notebook>
      </ion-list>
    </ion-content>
  `
})
export class MailInComponent {
  current_user$;
  current_user;
  has_address: boolean = false;
  require_token: boolean = false;
  sub: Subscription;
  notebooks$: Observable<Notebook[]>;
  business: boolean = false;

  constructor(private store: Store<AppState>,
              private actions$: Actions,
              private alertCtrl: AlertController,
              private translate: TranslateService,
              private resourceSrv: ResourcesService,
              private userSrv: UserService) {
    this.current_user$ = this.userSrv.getCurrentUser();
    this.notebooks$ = resourceSrv.getNotebooks();
  }

  ngOnInit() {
    this.sub = Observable.combineLatest(
      this.current_user$,
      this.store.select("current_user").map(data => data["business"])
    )
      .subscribe(([user, business]) => {
        this.has_address = !!user ? !!user["mailin_address"] : false;
        this.require_token = !!user ? !!user["mailin_require_token"] : false;
        this.current_user = user;
        this.business = business;
      })
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  toggleToken(event) {
    this.current_user$.first().subscribe(user => {
      this.store.dispatch({
        type: UserActions.CHANGED,
        payload: {
          _id: user._id,
          mailin_require_token: event.checked
        }
      });
    });
  }

  changeAddress() {
    this.translate.get(
      ["MAIL_IN.ADDRESS", "MAIL_IN.ADDRESS_SHORT", "MAIL_IN.INTRO", "UI.CANCEL", "UI.OK"]
    )
      .first()
      .withLatestFrom(this.current_user$)
      .subscribe(([trans, user]) => {
        console.log(trans);
        let alert = this.alertCtrl.create({
          title: trans["MAIL_IN.ADDRESS"],
          message: trans["MAIL_IN.INTRO"],
          inputs: [
            {
              name: "address",
              placeholder: trans["MAIL_IN.ADDRESS_SHORT"],
              value: user["mailin_address"]
            }
          ],
          buttons: [
            {
              text: trans["UI.CANCEL"],
              role: "cancel",
            },
            {
              text: trans["UI.OK"],
              handler: data => {
                if (data.address != user.mailin_address) {
                  this.store.dispatch({
                    type: UserActions.CHANGED,
                    payload: {
                      _id: user._id,
                      mailin_address: data.address
                    }
                  })
                }
              }
            }
          ]
        });
        alert.present();
      })
  }
}
