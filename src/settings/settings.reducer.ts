import * as SettingsActions from "./settings.actions"

export const settingsReducer = (state={_id: "settings", time_offset: 0}, action) => {
  switch (action.type) {

    case SettingsActions.FROM_DATABASE:
      return Object.assign({}, action.payload);

    case SettingsActions.TIME_FROM_SERVER:
      return Object.assign({}, state, {
        time_offset: action.payload.timestamp - (new Date().getTime()/1000),
        "#dirty-db": true
      });

    default:
      return state
  }
}
