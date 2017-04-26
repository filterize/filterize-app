/* Simple Google API OAuth 2.0 Client flow library

  Author: timdream

  Usage:
  var go2 = new GO2(options)
    Create an instance for the library.
    options is an object with the following properties:
    - clientId (required)
    - redirectUri (optional, default to the current page)
      To use the current page as the redirectUri,
      put this script before Analytics so that the second load won't result
      a page view register.
    - scope (optional, default to 'https://www.googleapis.com/auth/plus.me')
      A string or array indicates the Google API access your application is
      requesting.
    - popupWidth
    - popupHeight
  go2.login(approvalPrompt, immediate): Log in.
    Set immediate to true to attempt to login with a invisible frame.
    Set approvalPrompt to true to force the popup prompt.
  go2.logout(): Log out. Note that this does not invalidate access token.
  go2.getAccessToken(): return the token.
  go2.onlogin: callback(accessToken)
  go2.onlogout: callback()
  go2.destory: remove external references in the DOM for this instance.
*/

/* global define, module, require */

/**
 * Definition file for the node.js module
 *
 */
export interface GoogleOAuth2Options {
  clientId: string
  redirectUri?: string;
  scope?: string | string[];
  popupHeight?: number;
  popupWidth?: number;
  responseType?: string;
  accessType?: string;
}

declare class GoogleOAuth2 {
  constructor(options: GoogleOAuth2Options);
  public onlogout: () => void;
  public onlogin: (accessToken:string) => void;
  getAccessToken();
  login(approvalPrompt?: boolean, immediate?: boolean);
  logout();
  destory();
}


export class GO2 {
  WINDOW_NAME = 'google_oauth2_login_popup';
  OAUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';

  _clientId = null;
  _scope = 'https://www.googleapis.com/auth/plus.me';
  _redirectUri = '';

  _popupWindow = null;
  _immediateFrame = null;

  _stateId = Math.random().toString(32).substr(2);
  _accessToken = undefined;
  _timer = undefined;

  _popupWidth = 500;
  _popupHeight = 400;

  _responseType ='token';
  _accessType = 'online';

  onlogin = null;
  onlogout = null;

  constructor(options) {
    if (!options || !options.clientId) {
      throw 'You need to at least set the clientId';
    }

    if (typeof window != 'undefined') {
      this._redirectUri = window.location.href.substr(0,
        window.location.href.length -
        window.location.hash.length)
        .replace(/#$/, '');
    }


    // Save the client id
    this._clientId = options.clientId;

    // if scope is an array, convert it into a string.
    if (options.scope) {
      this._scope = Array.isArray(options.scope) ?
        options.scope.join(' ') :
        options.scope;
    }

    // rewrite redirect_uri
    if (options.redirectUri) {
      this._redirectUri = options.redirectUri;
    }

    // rewrite redirect_uri
    if (options.redirectUriSuffix) {
      let sep = "";
      if (this._redirectUri.length > 0 && this._redirectUri[this._redirectUri.length-1] != "/" && options.redirectUriSuffix[0] != "/") {
        sep = "/";
      }
      this._redirectUri = this._redirectUri + sep + options.redirectUriSuffix;
    }

    // popup dimensions
    if (options.popupHeight) {
      this._popupHeight = options.popupHeight;
    }
    if (options.popupWidth) {
      this._popupWidth = options.popupWidth;
    }

    if (options.responseType) {
      this._responseType = options.responseType;
    }

    if (options.accessType) {
      this._accessType = options.accessType;
    }
  };

  receiveMessage() {
    var go2;
    if (window.opener && window.opener["__windowPendingGO2"]) {
      go2 = window.opener["__windowPendingGO2"];
    }
    if (window.parent && window.parent["__windowPendingGO2"]) {
      go2 = window.parent["__windowPendingGO2"];
    }


    var hash = window.location.hash;
    console.log(hash);
    if (go2 && hash.indexOf('access_token') !== -1) {
      go2._handleMessage(
        hash.replace(/^.*access_token=([^&]+).*$/, '$1'),
        parseInt(hash.replace(/^.*expires_in=([^&]+).*$/, '$1'), 10),
        hash.replace(/^.*state=go2_([^&]+).*$/, '$1')
      );
    }

    if (go2 && window.location.search.indexOf('code=')) {
      go2._handleMessage(
        window.location.search.replace(/^.*code=([^&]+).*$/, '$1'),
        null,
        window.location.search.replace(/^.*state=go2_([^&]+).*$/, '$1')
      );
    }

    if (go2 && window.location.search.indexOf('error=')) {
      go2._handleMessage(false);
    }
  }

  startListener() {
    let listener = (event) => {
      console.log(event);

      if (event.origin == `${window.location.protocol}//${window.location.host}`) {
        let hash = event.data;
        if (hash.indexOf('access_token') !== -1) {
          this._handleMessage(
            hash.replace(/^.*access_token=([^&]+).*$/, '$1'),
            parseInt(hash.replace(/^.*expires_in=([^&]+).*$/, '$1'), 10),
            hash.replace(/^.*state=go2_([^&]+).*$/, '$1')
          );
        }
      }

      window.removeEventListener("message", listener);
    };
    window.addEventListener("message", listener);
  }

  login(forceApprovalPrompt?, immediate?) {
    if (this._accessToken) {
      return;
    }

    this.startListener();

    this._removePendingWindows();

    window["__windowPendingGO2"] = this;

    var url = this.OAUTH_URL +
      '?response_type=' + this._responseType +
      '&access_type='+ encodeURIComponent(this._accessType) +
      '&redirect_uri=' + encodeURIComponent(this._redirectUri) +
      '&scope=' + encodeURIComponent(this._scope) +
      '&state=go2_' + this._stateId +
      '&client_id=' + encodeURIComponent(this._clientId);

    console.log(url);

    if (!immediate && forceApprovalPrompt) {
      url += '&approval_prompt=force';
    }

    if (immediate) {
      url += '&approval_prompt=auto';

      // Open up an iframe to login
      // We might not be able to hear any of the callback
      // because of X-Frame-Options.
      var immediateFrame =
        this._immediateFrame = document.createElement('iframe');
      immediateFrame.src = url;
      immediateFrame.hidden = true;
      immediateFrame.width = immediateFrame.height = "1";
      immediateFrame.name = this.WINDOW_NAME;
      document.body.appendChild(immediateFrame);

      return;
    }

    // Open the popup
    var left =
      window.screenX + (window.outerWidth / 2) - (this._popupWidth / 2);
    var top =
      window.screenY + (window.outerHeight / 2) - (this._popupHeight / 2);
    var windowFeatures = 'width=' + this._popupWidth +
      ',height=' + this._popupHeight +
      ',top=' + top +
      ',left=' + left +
      ',location=yes,toolbar=no,menubar=no';
    this._popupWindow = window.open(url, this.WINDOW_NAME, windowFeatures);
  }

  logout() {
    if (!this._accessToken) {
      return;
    }

    this._removePendingWindows();

    clearTimeout(this._timer);
    this._accessToken = undefined;
    if (this.onlogout) {
      this.onlogout();
    }
  }

  getAccessToken() {
    return this._accessToken;
  }

  // receive token from popup / frame
  _handleMessage(token, expiresIn, stateId) {
    console.log("handle", token, expiresIn, stateId);
    if (this._stateId !== stateId) {
      return;
    }

    this._removePendingWindows();

    // Do nothing if there is no token received.
    if (!token) {
      return;
    }

    this._accessToken = token;

    if (this.onlogin) {
      this.onlogin(this._accessToken);
    }

    if (expiresIn) {
      // Remove the token if timed out.
      clearTimeout(this._timer);
      this._timer = setTimeout(
        function tokenTimeout() {
          this._accessToken = undefined;
          if (this.onlogout) {
            this.onlogout();
          }
        }.bind(this),
        expiresIn * 1000
      );
    }
  }

  destory() {
    if (this._timer) {
      clearTimeout(this._timer);
    }
    this._removePendingWindows();
  }

  _removePendingWindows() {
    if (this._immediateFrame) {
      document.body.removeChild(this._immediateFrame);
      this._immediateFrame = null;
    }

    if (this._popupWindow) {
      this._popupWindow.close();
      this._popupWindow = null;
    }

    if (window["__windowPendingGO2"] === this) {
      delete window["__windowPendingGO2"];
    }
  }
}

