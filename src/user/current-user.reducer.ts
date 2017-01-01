import * as UserActions from "./user.actions";
import { profileLabelFromToken } from "./user.tools";

export const currentUserReducer = (state={profile: "", business: false}, action) => {
  switch (action.type) {
    case UserActions.LOGIN_SUCCESS:
      return {
        profile: profileLabelFromToken(action.payload.access_token),
        business: false
      };

    case UserActions.SELECT:
      return {
        profile: action.payload,
        business: false
      };

    case UserActions.FROM_DATABASE:
      return state.profile ? state : {profile: action.payload._id, business: false};

    case UserActions.SELECT_BUSINESS:
      return {
        profile: state.profile,
        business: action.payload
      };

    default:
      return state;
  }
};
