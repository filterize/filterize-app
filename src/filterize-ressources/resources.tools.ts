export const ignoreDeletedFilter = (obj:{deleted:boolean}, index: number, array: {deleted:boolean}[]) => !obj.deleted;
