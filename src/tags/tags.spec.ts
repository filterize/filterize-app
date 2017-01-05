export interface Tag {
  name: string,
  "#hash(pin)"?: string,
  parentGuid?: string,
  active: boolean,
  "#changed"?: number,
  guid: string,
  updateSequenceNum: number
  _id?: string
  _rev?: string
}

export interface TagHierarchyElement {
  tag?: Tag,
  children: TagHierarchyElement[]
}
