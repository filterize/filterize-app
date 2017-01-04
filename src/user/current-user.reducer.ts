import * as UserActions from "./user.actions";
import { profileLabelFromToken } from "./user.tools";

export const currentUserReducer = (state={profile: "", business: false, _id: "current_user"}, action) => {
  switch (action.type) {
    case UserActions.LOGIN_SUCCESS:
      return Object.assign({}, state, {
        profile: profileLabelFromToken(action.payload.access_token),
        business: false,
        "#dirty-db": true
      });

    case UserActions.SELECT:
      return Object.assign({}, state, {
        profile: action.payload,
        business: false,
        "#dirty-db": true
      });

    case UserActions.SELECT_BUSINESS:
      return Object.assign({}, state, {
        profile: state.profile,
        business: action.payload,
        "#dirty-db": true
      });

    case "CURRENT_USER_FROM_DATABASE":
      return Object.assign({}, action.payload);

    case UserActions.LOGOUT:
      return Object.assign({}, state, {
        profile: "",
        business: false,
        "#dirty-db": true
      });

    default:
      return state;
  }
};
