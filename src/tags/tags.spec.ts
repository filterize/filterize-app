export interface Tag {
  name: string,
  "#hash"?: string,
  parentGuid?: string,
  active: boolean,
  "#changed"?: number,
  guid: string,
  updateSequenceNum: number
  deleted?: boolean,
  _id?: string
  _rev?: string
}

export interface TagHierarchyElement {
  tag?: Tag,
  children: TagHierarchyElement[]
}
