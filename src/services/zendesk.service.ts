import { UserService } from "./user.service";
import { Injectable } from "@angular/core";
import { App, NavController } from "ionic-angular";

declare var zE;
declare var $zopim;
declare var window;

@Injectable()
export class ZendeskService {
  constructor(private userSrv: UserService) {
    this.userSrv.getCurrentUser().subscribe(user => {
      let data;
      if (user) {
        data = {
          name: `${user["first_name"]} ${user['last_name']}`,
          email: user["email"],
        }
      } else {
        data = {
          name: "",
          email: "",
        }
      }
      zE(() => zE.identify(data));
    });
  }

  startSupport() {
    if (!!zE.activate) {
      zE.activate({hideOnClose: true});
    }
  }

  updatePath() {
    if (window["$zopim"] != undefined && !!$zopim.livechat) {
      $zopim.livechat.sendVisitorPath();
    }
    if (!!zE.activate) {
      zE.setHelpCenterSuggestions({url: true});
    }
  }
}
