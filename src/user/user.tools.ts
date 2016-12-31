import { JwtHelper } from "angular2-jwt";
import { Headers } from "@angular/http";

let jwtHelper = new JwtHelper();

export const profileLabelFromTokenData = (data) =>
  "consultant_id" in data ? `user_${data.consultant_id}_${data.user_id}` : `user_${data.profile_id}`;

export const profileLabelFromToken = (token: string) => profileLabelFromTokenData(jwtHelper.decodeToken(token));

export const jwtHeader = jwt => new Headers({Authorization: `Bearer ${jwt}`});

export const jwtHeaderOnlyOptions = (jwt => Object.assign({headers: jwtHeader(jwt)}));
