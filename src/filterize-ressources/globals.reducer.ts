import { combineReducers } from "@ngrx/store";
import { GLOBAL_RESOURCES } from "./resources.list";

let getSpecialGlobalReducer = (type: any) => {
  return (state={_id: type.name}, action) => {
    switch (action.type) {
      case `${type.action_prefix}_FROM_SERVER`:
        return Object.assign({}, state, action.payload, {"#dirty-db": true});
      case `${type.action_prefix}_FROM_DATABASE`:
        return Object.assign({}, action.payload);
      default:
        return state
    }
  }
};

let reducerMap = Object();
for (let res of GLOBAL_RESOURCES) {
  if (res.name) {
    reducerMap[res.name] = getSpecialGlobalReducer(res);
  }
}

export const globalReducer = combineReducers(reducerMap);
