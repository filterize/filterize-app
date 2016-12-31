import { AppState } from "../app/appstate";
import { Observable } from "rxjs";

export const currentUserSelector = () => {
  return state => state
    .map(([userlist, current_user]) => userlist.find(user => user._id === current_user.profile))
}

