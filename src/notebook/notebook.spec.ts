export interface Notebook {
  "#changed": number,
  "#hash": string,
  business_library: boolean,
  calendar_active: boolean,
  calendar_token: string,
  contact: number,
  contact_label: string,
  default: boolean,
  deleted?: boolean,
  guid: string,
  name: string,
  shared: NotebookShare[],
  stack: string,
  updateSequenceNum: number
}

export interface NotebookShare {
  email: string,
  privilege: 1,
  username: string
}
