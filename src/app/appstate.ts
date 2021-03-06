import { RouterState } from '@ngrx/router-store';

export interface AppState {
  router: RouterState;
  userlist: Object[];
  current_user: {
    profile: string,
    business: boolean
  };
  globals: {
    country_devisions: Object
  };
  settings: {
    language: string
  }
};
