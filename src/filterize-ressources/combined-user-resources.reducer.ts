import { combineReducers } from "@ngrx/store";
import { USER_RESOURCES } from "./resources.list";
import * as UserActions from "../user/user.actions";

let getSpecialUserResourceReducer = (type: any, type_name) => {
  return (state=[], action) => {
    switch (action.type) {
      case UserActions.CLEAR_DATA:
        return [];

      case `${type.action_prefix}_FROM_SERVER`:
        return Object.assign({}, state, action.payload, {"#dirty-db": true});

      case `${type.action_prefix}_FROM_DATABASE`:
        return Object.assign({}, action.payload);

      case `${type.action_prefix}_BULK_FROM_SERVER`: {
        let meta_object = Object();
        for (let obj of state) {
          meta_object[obj[type.id]] = Object.assign({}, obj)
        }
        for (let obj of action.payload) {
          meta_object[obj[type.id]] = Object.assign(
            {},
            meta_object[obj[type.id]],
            obj,
            {_id: `${type_name}_${obj[type.id]}`, "#dirty-db": true})
        }
        let result = [];
        for (let key in meta_object) {
          result.push(meta_object[key]);
        }
        return result;
      }

      case `${type.action_prefix}_BULK_FROM_DATABASE`: {
        let meta_object = Object();
        for (let obj of state) {
          meta_object[obj[type.id]] = Object.assign({}, obj)
        }
        for (let obj of action.payload) {
          meta_object[obj[type.id]] = Object.assign(
            {},
            meta_object[obj[type.id]],
            obj)
        }
        let result = [];
        for (let key in meta_object) {
          result.push(meta_object[key]);
        }
        return result;
      }

      default:
        return type["reducer"] ? type["reducer"](state, action) : state;
    }
  }
};

export let userResourceReducerAddOn = Object();
for (let key in USER_RESOURCES) {
  let res = USER_RESOURCES[key];
  userResourceReducerAddOn[res.store] = getSpecialUserResourceReducer(res, key);
}
