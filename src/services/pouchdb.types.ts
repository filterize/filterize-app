export interface ResultRow {
  doc?: Object,
  id: string,
  key: string,
  value: Object
}

export interface SearchDocsResult {
  total_rows: number,
  offset: number,
  rows: ResultRow[]
}
