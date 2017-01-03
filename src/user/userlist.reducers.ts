import * as UserActions from "./user.actions";
import { JwtHelper } from "angular2-jwt";
import { profileLabelFromTokenData } from "./user.tools";

let jwtHelper = new JwtHelper();

export const userlistReducer = (state=[], action) => {
  switch (action.type) {

    case UserActions.REFRESH_TOKEN:
    case UserActions.LOGIN_SUCCESS: {
      let data = jwtHelper.decodeToken(action.payload.access_token);
      let id = profileLabelFromTokenData(data)
      let old = state.find(obj => obj._id === id);
      return [
        ...state.filter(obj => obj._id !== id),
        Object.assign({}, {_id: id, "#dirty-db": true}, old, action.payload, data)
      ]
    }

    case UserActions.FROM_DATABASE:
      return [
        ...state.filter(obj => obj._id !== action.payload._id),
        action.payload
      ];

    case UserActions.BASIC_DETAILS_FROM_SERVER:
      return state
        .map(obj => obj.profile_id == action.payload.profile.id
          ? Object.assign(obj, action.payload, {"#dirty-db": true})
          : obj
        );

    default:
      return state;
  }
};
