import * as UserActions from "./user.actions";
import { JwtHelper } from "angular2-jwt";
import { profileLabelFromTokenData } from "./user.tools";

let jwtHelper = new JwtHelper();

export const userlistReducer = (state=[], action) => {
  switch (action.type) {

    case UserActions.REFRESH_TOKEN:
    case UserActions.LOGIN_SUCCESS: {
      let data = jwtHelper.decodeToken(action.payload.access_token);
      let id = profileLabelFromTokenData(data);
      let old = state.find(obj => obj._id === id);
      return [
        ...state.filter(obj => obj._id !== id),
        Object.assign({}, {_id: id, "#dirty-db": true}, old, action.payload, data)
      ]
    }

    case UserActions.LOGOUT:
      return state.filter(obj => obj._id !== action.payload);

    case UserActions.FROM_DATABASE:
      return [
        ...state.filter(obj => obj._id !== action.payload._id),
        action.payload
      ];

    case UserActions.DETAILS_FROM_SERVER:
      return state
        .map(obj => obj.profile_id == action.payload.profile_id
          ? Object.assign(obj, action.payload, {"#dirty-db": true, "#dirty-server": false, "#dirty-server-sync": false})
          : obj
        );

    case UserActions.SYNC_SINGLE_OK:
      return state
        .map(obj => obj._id == action.payload._id && obj._rev == action.payload._rev
          ? Object.assign(obj, action.payload, {"#dirty-db": true, "#dirty-server": false, "#dirty-server-sync": false})
          : obj
        );

    case UserActions.SYNC_SINGLE_FAILED:
      return state
        .map(obj => obj._id == action.payload._id && obj._rev == action.payload._rev
          ? Object.assign(obj, {"#dirty-db": true, "#dirty-server": false, "#dirty-server-sync": true})
          : obj
        );

    case UserActions.CHANGED:
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

    default:
      return state;
  }
};
