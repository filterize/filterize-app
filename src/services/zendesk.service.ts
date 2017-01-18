import { UserService } from "./user.service";
import { Injectable } from "@angular/core";

declare var zE;

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
          name: null,
          email: null,
        }
      }
      zE(() => zE.identify(data));
    })
  }

  startSupport() {
    zE.activate({hideOnClose: true});
  }
}
