import { Injectable } from "@angular/core";
import { CONFIG } from "../app/config";
import { UserService } from "./user.service";
import { Store } from "@ngrx/store";
import { AppState } from "../app/appstate";
import * as UserActions from "../user/user.actions";

@Injectable()
export class EvernoteService {
  _WINDOW_NAME = 'evernote_popup';
  _redirectUriSuffix = 'evernote.html';

  _popupWindow = null;
  _accessToken = undefined;
  _timer = undefined;

  _popupWidth = 760;
  _popupHeight = 800;

  constructor(private userSrv:UserService, private store: Store<AppState>) {};

  startListener() {
    let listener = (event) => {
      console.log(event);

      if (event.origin == `${window.location.protocol}//${window.location.host}`) {
        let hash = event.data;
        if (hash.indexOf('access_token') !== -1) {
          let token = hash.replace(/^.*access_token=([^&]+).*$/, '$1');
          this.store.dispatch({
            type: UserActions.LOGIN_SUCCESS,
            payload: {
              access_token: token
            }
          })
        }
      }

      window.removeEventListener("message", listener);
    };
    window.addEventListener("message", listener);
  }

  validate() {
    this.startListener();

    this.userSrv.currentUser$
      .first()
      .subscribe(user => {

        let url = CONFIG.filterize.evernote_auth_url +
          '?jwt=' + encodeURIComponent(user.access_token) +
          '&redirect_uri=' + encodeURIComponent(`${window.location.protocol}//${window.location.host}/${this._redirectUriSuffix}`) +
          '&client_id=' + encodeURIComponent(CONFIG.filterize.client_id);

        console.log(url);

        // Open the popup
        let left = window.screenX + (window.outerWidth / 2) - (this._popupWidth / 2);
        var top = window.screenY + (window.outerHeight / 2) - (this._popupHeight / 2);
        var windowFeatures = 'width=' + this._popupWidth +
          ',height=' + this._popupHeight +
          ',top=' + top +
          ',left=' + left +
          ',location=yes,toolbar=no,menubar=no';
        this._popupWindow = window.open(url, this._WINDOW_NAME, windowFeatures);
    });
  }
}
