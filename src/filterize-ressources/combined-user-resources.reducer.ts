import { combineReducers } from "@ngrx/store";
import { USER_RESOURCES } from "./resources.list";
import * as UserActions from "../user/user.actions";

let getSpecialUserResourceReducer = (type: any, type_name) => {
  return (state=[], action) => {
    switch (action.type) {
      case UserActions.CLEAR_DATA:
        return [];

      case `${type.action_prefix}_FROM_SERVER`:
        return [
          ...state.filter(obj => obj._id != action.payload._id),
          Object.assign(
            {},
            state.find(obj => obj._id == action.payload._id),
            action.payload,
            {"#dirty-db": true, "#dirty-server": false, "#dirty-server-sync": false}
          )
        ];

      case `${type.action_prefix}_FROM_DATABASE`:
        return [
          ...state.filter(obj => obj._id != action.payload._id),
          Object.assign(
            {},
            state.find(obj => obj._id == action.payload._id),
            action.payload
          )
        ];

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
            {_id: `${type_name}_${obj[type.id]}`, "#dirty-db": true, "#dirty-server": false, "#dirty-server-sync": false})
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

      case `${type.action_prefix}_CHANGED`:
        return state.map(obj =>
          (obj._id == action.payload._id)
            ? Object.assign(
                {},
                obj,
                action.payload,
                {"#dirty-db": true, "#dirty-server": true, "#dirty-server-sync": false}
              )
            : obj
          );

      case `${type.action_prefix}_SINGLE_SYNC_OK`:
        return state.map(obj =>
          (obj._id == action.payload._id && obj._rev == action.payload._rev)
            ? Object.assign({}, obj, action.payload, {"#dirty-server": false, "#dirty-db": true})
            : obj
        );

      case `${type.action_prefix}_SINGLE_SYNC_FAIL`:
        return state.map(obj =>
          (obj._id == action.payload._id && obj._rev == action.payload._rev)
            ? Object.assign({}, obj, {"#dirty-server": false, "#dirty-server-sync": true, "#dirty-db": true})
            : obj
        );

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
