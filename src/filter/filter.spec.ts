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
