import { Component, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import { AppState } from "../../app/appstate";
import { Http } from "@angular/http";
import { UserService } from "../../services/user.service";
import { CONFIG } from "../../app/config";
import { jwtHeaderOnlyOptions } from "../../user/user.tools";
import * as UserActions from "../../user/user.actions";
import { LoadingController, ToastController, AlertController } from "ionic-angular";
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
            <button ion-button item-right clear icon-only color="danger" (click)="askDeleteUser(user, $event)">
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
            <button ion-button item-right clear icon-only color="danger" (click)="askDeleteConsultant(user, $event)">
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
              private toastCtrl: ToastController,
              private alertCtrl: AlertController,
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
              this.trans.get("CONSULTANT.ERROR.LOGIN")
                .subscribe(msg => {
                  let toast = this.toastCtrl.create({
                    message: msg,
                    duration: 3000
                  });
                  toast.present();
                })
            }
          )

      })
  }

  deleteConsultant(selectedUser: UserInfo) {
    let loading = this.loadingCtrl.create();
    this.trans.get("UI.LOADING").subscribe(content => {
      loading.setContent(content);
    });
    loading.present();

    this.userSrv.getCurrentUser()
      .first()
      .subscribe(user => {
        this.http.delete(
          `${CONFIG.filterize.api_url}/user/${user.user_id}/consultants/consultant/${selectedUser.user_id}`,
          jwtHeaderOnlyOptions(user.access_token),
        )
          .subscribe(
            () => {
              loading.dismiss();
              this.consultants = this.consultants.filter((obj) => obj != selectedUser);
            },
            error => {
              console.log(error);
              loading.dismiss();
              this.trans.get("CONSULTANT.ERROR.DELETE_CONSULTANT")
                .subscribe(msg => {
                  let toast = this.toastCtrl.create({
                    message: msg,
                    duration: 3000
                  });
                  toast.present();
                })
            }
          )

      })
  }

  deleteUser(selectedUser: UserInfo) {

    let loading = this.loadingCtrl.create();
    this.trans.get("UI.LOADING").subscribe(content => {
      loading.setContent(content);
    });
    loading.present();

    this.userSrv.getCurrentUser()
      .first()
      .subscribe(user => {
        this.http.delete(
          `${CONFIG.filterize.api_url}/user/${user.user_id}/consultants/user/${selectedUser.user_id}`,
          jwtHeaderOnlyOptions(user.access_token),
        )
          .subscribe(
            () => {
              loading.dismiss();
              this.consultants = this.consultants.filter((obj) => obj != selectedUser);
            },
            error => {
              console.log(error);
              loading.dismiss();
              this.trans.get("CONSULTANT.ERROR.DELETE_CLIENT")
                .subscribe(msg => {
                  let toast = this.toastCtrl.create({
                    message: msg,
                    duration: 3000
                  });
                  toast.present();
                })
            }
          )

      })
  }

  askDeleteConsultant(selectedUser: UserInfo, event) {
    event.stopPropagation();

    this.trans.get(["CONSULTANT.DELETE_CONSULTANT", "CONSULTANT.DELETE_CONSULTANT_MSG", "UI.OK", "UI.CANCEL"])
      .subscribe(t => {
        let confirm = this.alertCtrl.create({
          title: t["CONSULTANT.DELETE_CONSULTANT"],
          message: t["CONSULTANT.DELETE_CONSULTANT_MSG"],
          buttons: [
            {
              text: t["UI.CANCEL"]
            },
            {
              text: t["UI.OK"],
              handler: () => {
                this.deleteConsultant(selectedUser);
              }
            }
          ]
        });
        confirm.present();
      })

  }

  askDeleteUser(selectedUser: UserInfo, event) {
    event.stopPropagation();

    this.trans.get(["CONSULTANT.DELETE_CLIENT", "CONSULTANT.DELETE_CLIENT_MSG", "UI.OK", "UI.CANCEL"])
      .subscribe(t => {
        let confirm = this.alertCtrl.create({
          title: t["CONSULTANT.DELETE_CLIENT"],
          message: t["CONSULTANT.DELETE_CLIENT_MSG"],
          buttons: [
            {
              text: t["UI.CANCEL"]
            },
            {
              text: t["UI.OK"],
              handler: () => {
                this.deleteUser(selectedUser);
              }
            }
          ]
        });
        confirm.present();
      })

  }

}
