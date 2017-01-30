import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Filter, FilterUser } from "./filter.spec";
import { Store } from "@ngrx/store";
import { AppState } from "../app/appstate";
import { UserService } from "../services/user.service";
import { filter } from "rxjs/operator/filter";

interface UserName {
  name: string,
  user: number
}

@Injectable()
export class FilterService {
  filters$: Observable<Filter[]>;
  user$: Observable<any>;
  business$: Observable<boolean>;

  constructor(private store: Store<AppState>, private userSrv: UserService) {
    this.filters$ = store.select("filters") as Observable<Filter[]>;
    this.user$ = this.userSrv.getCurrentUser();
    this.business$ = store.select("current_user")
      .map(obj => obj["business"])
      .distinctUntilChanged();
  }

  getOtherUsers(): Observable<UserName[]> {
    return Observable.combineLatest(
      this.filters$,
      this.user$,
      this.business$
    )
      .map(([filters, user, business]) => {
        if (!business) {
          return [];
        }
        if (!user["business"]) {
          return []
        }
        if (user["business_admin"]) {
          return user["business"]["users"];
        }
        let uids: number[] = [];

        // Fetch all user ids from all available filters
        for (let f of filters) {
          if (f.users) {
            for (let u in f.users) {
              let uid = f.users[u].user;
              if (uids.indexOf(uid) == -1 && uid != user["user_id"]) {
                uids.push(uid);
              }
            }
          }
        }
        return (user["business"]["users"] as UserName[]).filter(obj => uids.indexOf(obj.user) != -1);
      })
      .map((obj: UserName[]) => obj.sort((a: UserName, b:UserName) => a.name < b.name ? -1 : 1));
  }

  getFilterByGroup(business:boolean|string, group:string|number): Observable<Filter[]> {
    if (typeof business == "string") {
      business = (business as string).toLowerCase() == "true";
    }

    let condition: (Filter)=>boolean = (f) => true;

    if (business) {

      if (group == "global") {
        condition = (f) => !f.users
      }
      else {
        if (group == "my") {
          this.user$.first().subscribe(user => group = user["user_id"] as number);
        }
        group = typeof group == "string" ? parseInt(group as string) : group;
        condition = (f) => f.users.find((elem: FilterUser) => elem.user == group);
      }
    }
    return this.filters$.map(list => list.filter(f => condition(f)));
  }

  getStacksByGroup(business:boolean|string, group:string|number): Observable<string[]> {
    if (typeof business == "string") {
      business = (business as string).toLowerCase() == "true";
    }

    let condition: (Filter)=>boolean = (f) => true;
    let toStack: (Filter)=>string = (f) => f.stack ? f.stack : "";

    if (business) {

      if (group == "global") {
        condition = (f) => {
          for (let x in f.users) {
            return false;
          }
          return true;
        }
      }
      else {
        if (group == "my") {
          this.user$.first().subscribe(user => group = user["user_id"] as number);
        }
        group = typeof group == "string" ? parseInt(group as string) : group;
        condition = (f) => {
          if (!f.users) {
            return false;
          }
          for (let u in f.users) {
            if (f.users[u].user == group) return true;
          }
          return false;
        };
        toStack = (f) => {
          for (let u in f.users) {
            if (f.users[u].user == group) return f.users[u].stack ? f.users[u].stack : "";
          }
          return "";
        };
      }
    }
    return this.filters$
      // check if in selected group
      .map(list => list.filter(f => condition(f)))
      // extract stack
      .map(list => list.map(f => toStack(f)))
      // make stacks unique
      .map(list => list.filter((value, index, self) => self.indexOf(value) === index))
      // sort
      .map(list => list.sort((a:string, b:string) => a < b ? -1 : 1));
  }

}
