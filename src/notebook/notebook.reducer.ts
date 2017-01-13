import { Action } from "@ngrx/store";
import * as CalendarActions from "../pages/calendar/calendar.actions"
import { Notebook } from "./notebook.spec";

export const notebookReducer = (state=[], action:Action) => {
  switch (action.type) {
    case CalendarActions.ENABLE:
      return state.map((nb:Notebook) =>
        nb.guid == action.payload
          ? Object.assign(
            {}, nb,
            {calendar_active: true, "#dirty-db": true, "#dirty-server": true, "#dirty-server-sync": false})
          : nb
      );
    case CalendarActions.DISABLE:
      return state.map((nb:Notebook) =>
        nb.guid == action.payload
          ? Object.assign(
            {}, nb,
            {calendar_active: false, "#dirty-db": true, "#dirty-server": true, "#dirty-server-sync": false})
          : nb
      );
    case CalendarActions.REVOKE:
      return state.map((nb:Notebook) =>
        nb.guid == action.payload
          ? Object.assign(
            {}, nb,
            {calendar_token: "", "#dirty-db": true, "#dirty-server": true, "#dirty-server-sync": false})
          : nb
      );
    default:
      return state;
  }
};
