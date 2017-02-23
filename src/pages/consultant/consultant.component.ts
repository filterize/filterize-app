import { Component, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import { AppState } from "../../app/appstate";
import { Http } from "@angular/http";
import { UserService } from "../../services/user.service";
import { CONFIG } from "../../app/config";
import { jwtHeaderOnlyOptions } from "../../user/user.tools";
import * as UserActions from "../../user/user.actions";
import { LoadingController } from "ionic-angular";
import { TranslateService } from "ng2-translate";

interface UserInfo {
  user_id: number,
  until: number,
  name: string,
  scope: number
}

@Component({
  template: `
    <ion-header>
      <ion-navbar>
        
        <button ion-button icon-only menuToggle>
          <ion-icon name="menu"></ion-icon>
        </button>
    
        <ion-title>
          <ion-icon name="contacts"></ion-icon>
          {{ "CONSULTANT.TITLE" | translate }}
        </ion-title>
      </ion-navbar>
    </ion-header>
    
    <ion-content>  
     
    <ion-card *ngIf="users.length > 0 || link.length > 0">
      <ion-card-header>{{ "CONSULTANT.CLIENTS" | translate}}</ion-card-header>
      <ion-card-content>
        <ion-list>
          <ion-item *ngIf="link.length > 0">
            {{ "CONSULTANT.LINK" | translate}} <br>
            <a [href]="link"><strong>{{ link }}</strong></a>
          </ion-item>
          
          <button ion-item *ngFor="let user of users" (click)="switchUser(user)">
            <strong>{{ user.name }}</strong><br>
            <p *ngIf="user.until">
              {{ "CONSULTANT.UNTIL" | translate}}
              {{ user.until * 1000 | filterize_date: "date-time"}}
            </p>
            <button ion-button item-right clear icon-only color="danger" (click)="deleteUser(user, $event)">
              <ion-icon name="trash"></ion-icon>
            </button>

          </button>
        </ion-list>
      </ion-card-content>
    </ion-card>
     
    <ion-card *ngIf="consultants.length > 0">
      <ion-card-header>{{ "CONSULTANT.CONSULTANTS" | translate}}</ion-card-header>
      <ion-card-content>
        <ion-list>
          <ion-item *ngFor="let user of consultants" (click)="switchUser(user)">
            <strong>{{ user.name }}</strong><br>
            <p *ngIf="user.until">
              {{ "CONSULTANT.UNTIL" | translate}}
              {{ user.until * 1000 | filterize_date: "date-time"}}
            </p>
            <button ion-button item-right clear icon-only color="danger" (click)="deleteConsultant(user, $event)">
              <ion-icon name="trash"></ion-icon>
            </button>
          </ion-item>
        </ion-list>
      </ion-card-content>
    </ion-card>
     
    </ion-content>
  `
})
export class ConsultantComponent implements OnInit {
  users: UserInfo[] = [];
  consultants: UserInfo[] = [];
  link: string = "";
  offline: boolean = false;

  constructor(private store: Store<AppState>,
              private userSrv: UserService,
              private loadingCtrl: LoadingController,
              private trans: TranslateService,
              private http: Http) {}

  ngOnInit(): void {
    this.offline = false;

    let loading = this.loadingCtrl.create();
    this.trans.get("UI.LOADING").subscribe(content => {
      loading.setContent(content);
    });
    loading.present();

    this.userSrv.getCurrentUser()
      .first()
      .subscribe(user => {
        this.http.get(
          `${CONFIG.filterize.api_url}/user/${user.user_id}/consultants`,
          jwtHeaderOnlyOptions(user.access_token),
        )
          .map(data => data.json())
          .map(data => data["data"])
          .subscribe(
            data => {
              console.log("consultant", data);
              this.users = data["users"];
              this.consultants = data["consultants"];
              this.link = data["consultant_link"];
              this.offline = false;
              loading.dismiss();
            },
            error => {
              this.offline = true;
              console.log(error);
              loading.dismiss();
            }
          )

      })
  }

  switchUser(selectedUser: UserInfo) {
    // this.store.dispatch({type: UserActions.LOGIN_SUCCESS, payload: data})
    let loading = this.loadingCtrl.create();
    this.trans.get("UI.LOADING").subscribe(content => {
      loading.setContent(content);
    });
    loading.present();

    this.userSrv.getCurrentUser()
      .first()
      .subscribe(user => {
        this.http.get(
          `${CONFIG.filterize.api_url}/user/${user.user_id}/consultants/user/${selectedUser.user_id}`,
          jwtHeaderOnlyOptions(user.access_token),
        )
          .map(data => data.json())
          .subscribe(
            data => {
              loading.dismiss();
              this.store.dispatch({type: UserActions.LOGIN_SUCCESS, payload: data});
            },
            error => {
              console.log(error);
              loading.dismiss();
            }
          )

      })
  }

  deleteConsultant(selectedUser: UserInfo, event) {
    event.stopPropagation();
  }

  deleteUser(selectedUser: UserInfo, event) {
    event.stopPropagation();
  }

}
