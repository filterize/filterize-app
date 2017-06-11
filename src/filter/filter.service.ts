import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Filter, FilterUser, ConditionActionSpec, FieldSpec, FilterAction } from "./filter.spec";
import { Store } from "@ngrx/store";
import { AppState } from "../app/appstate";
import { UserService } from "../services/user.service";
import { filter } from "rxjs/operator/filter";
import { Notebook } from "../notebook/notebook.spec";
import { Tag } from "../tags/tags.spec";
import { FilterizeTranslateService } from "../tools/filterize-translate.service";

interface UserName {
  name: string,
  user: number
}

@Injectable()
export class FilterService {
  filters$: Observable<Filter[]>;
  user$: Observable<any>;
  business$: Observable<boolean>;
  condition_specs: ConditionActionSpec[] = [];
  action_specs: ConditionActionSpec[] = [];
  tags: Tag[];
  notebooks: Notebook[];

  constructor(private store: Store<AppState>, private userSrv: UserService, private filterizeTransSrv: FilterizeTranslateService) {
    this.filters$ = store.select("filters") as Observable<Filter[]>;
    this.user$ = this.userSrv.getCurrentUser();
    this.business$ = store.select("current_user")
      .map(obj => !!obj["business"])
      .distinctUntilChanged();

    this.store.select("globals")
      .map(data => data["actions"])
      .distinctUntilChanged()
      .subscribe(data => {
        this.action_specs = [];
        for (let key in data) {
          if (!data[key]["elements"]) {
            continue
          }
          for (let ac of data[key]["elements"]) {
            this.action_specs.push(Object.assign({}, ac, {stack: data[key]["title"]}))
          }
        }
      });

    this.store.select("globals")
      .map(data => data["conditions"])
      .distinctUntilChanged()
      .subscribe(data => {
        console.log("conditions", data);
        this.condition_specs = [];
        for (let key in data) {
          if (!data[key]["elements"]) {
            continue
          }
          for (let cond of data[key]["elements"]) {
            this.condition_specs.push(Object.assign({}, cond, {stack: data[key]["title"]}))
          }
        }
      });

    this.store.select("notebooks")
      .subscribe((data:Notebook[]) => this.notebooks = data);

    this.store.select("tags")
      .subscribe((data:Tag[]) => this.tags = data);
  }

  getActionSpecs(): ConditionActionSpec[] {
    return this.action_specs;
  }

  getActionSpecByName(name: string): ConditionActionSpec {
    let spec = this.action_specs.find((obj: ConditionActionSpec) => obj.name == name);
    return spec ? spec : {name: name, title:name, parameters:[]}
  }

  getConditionSpecs(): ConditionActionSpec[] {
    return this.condition_specs;
  }

  getConditionSpecByName(name: string): ConditionActionSpec {
    let spec = this.condition_specs.find((obj: ConditionActionSpec) => obj.name == name);
    return spec ? spec : {name: name, title:name, parameters:[]}
  }

  getFieldValueLabel(value: any, spec: FieldSpec) {
    if (spec.values) {
      for (let val of spec.values) {
        if (val.value == value) {
          return this.filterizeTransSrv.translate(val.title);
        }
      }
    }
    if (spec.source == "tags") {
      let tag = this.tags.find((tag:Tag) => tag.guid == value);
      if (tag) {
        return tag.name;
      }
    }
    if (spec.source == "notebooks") {
      let nb = this.notebooks.find((nb:Notebook) => nb.guid == value);
      if (nb) {
        return nb.name;
      }
    }
    return value;
  }

  getFirstFieldValueLabel(obj: any, spec: ConditionActionSpec) {
    if (spec.parameters == null || spec.parameters.length==0) {
      return null;
    }
    let field:FieldSpec = spec.parameters[0];
    return this.getFieldValueLabel(obj[field.name], field);
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
        if (!user || !user["business"]) {
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

  getFilterByGroupAndStack(business:boolean|string, group:string|number, stack: string): Observable<Filter[]> {
    if (typeof business == "string") {
      business = (business as string).toLowerCase() == "true";
    }

    let condition: (Filter)=>boolean = (f) => true;
    let toStack: (Filter)=>string = (f) => f.stack ? f.stack : "__EMPTY__";

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
          this.user$.first().subscribe(user => group = user ? user["user_id"] as number : 0);
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
      }
      toStack = (f) => {
        for (let u in f.users) {
          if (f.users[u].user == group) return f.users[u].stack ? f.users[u].stack : "__EMPTY__";
        }
        return "__EMPTY__";
      };
    }

    let stack_condition: (Filter)=>boolean;
    if (stack == null) {
      stack_condition = (f) => true;
    } else {
      stack_condition = (f) => toStack(f) == stack;
    }

    return this.filters$
      // ignore deleted filter
      .map(list => list.filter(f => !f.deleted))
      // check for group
      .map(list => list.filter(f => condition(f)))
      // check for stack
      .map(list => list.filter(f => stack_condition(f)))
      // sort by order
      .map(list => list.sort((a:Filter, b:Filter) => Math.sign(a.order-b.order)));
  }

  getStacksByGroup(business:boolean|string, group:string|number): Observable<string[]> {
    if (typeof business == "string") {
      business = (business as string).toLowerCase() == "true";
    }

    let condition: (Filter)=>boolean = (f) => true;
    let toStack: (Filter)=>string = (f) => f.stack ? f.stack : "__EMPTY__";

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
          this.user$
            .first()
            .subscribe(user => group = user ? user["user_id"] as number : null);
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
            if (f.users[u].user == group) return f.users[u].stack ? f.users[u].stack : "__EMPTY__";
          }
          return "";
        };
      }
    }
    return this.filters$
      // ignore deleted filter
      .map(list => list.filter(f => !f.deleted))
      // check if in selected group
      .map(list => list.filter(f => condition(f)))
      // extract stack
      .map(list => list.map(f => toStack(f)))
      // add __EMPTY__ stack
      .map(list => ["__EMPTY__", ...list])
      // make stacks unique
      .map(list => list.filter((value, index, self) => self.indexOf(value) === index))
      // sort
      .map(list => list.sort((a:string, b:string) => a < b || a=="__EMPTY__" ? -1 : 1));
  }

}
