import { Tag } from "./tags.spec";
export const tagComparator = (a: Tag, b: Tag) => {
  return a.name < b.name ? -1 : 1;
};

export const tagSort = (tags: Tag[]) => [...tags].sort(tagComparator);

export const tagIgnoreDeleted = (tags: Tag[]) => tags.filter(t => !t.deleted);
