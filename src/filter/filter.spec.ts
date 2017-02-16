import { i18n_dict } from "../tools/tools.spec";
export interface FilterAction {
  type: string,
  guid?: string,
  [propName: string]: any
}

export interface FilterCondition {
  type: string,
  conditions?: FilterCondition[],
  guid?: string,
  "not"?: boolean
}

export interface FieldSpec {
  name: string,
  title: string | i18n_dict,
  description?: string | i18n_dict,
  type: string,
  "default"?: any,
  format?: string,
  pattern?: string,
  source?: string,
  null?: boolean,
  values?: {
    value: any,
    title: string | i18n_dict
  }[]
}

export interface ConditionActionSpec {
  name: string,
  title: string | i18n_dict,
  description?: string | i18n_dict,
  parameters: FieldSpec[],
  hide_private?: boolean,
  hide_business?: boolean,
  stack?: string | i18n_dict,
  sub_conditions?: boolean
}

export interface ConditionActionSpecStack {
  title: string | i18n_dict,
  elements: ConditionActionSpec[];
}

export interface FilterUser {
  active?: boolean,
  order: number,
  user: number,
  stack?: string
}

export interface FilterUserMap {
  [propName: string]: FilterUser,
  [propName: number]: FilterUser
}

export interface Filter {
  name: string,
  action: FilterAction[],
  condtion: FilterCondition,
  stack?: string,
  active: boolean,
  creator?: number,
  guid: string,
  order?: number,
  "public"?: boolean,
  users?: FilterUserMap,
  "#hash"?: string,
  "#changed"?: number,
  "#dirty-server"?: boolean,
  "#dirty-server-sync"?: boolean,
  "#dirty-db"?: boolean,
  "#can_edit": boolean,
  deleted?: boolean,
  _id?: string
  _rev?: string
}
