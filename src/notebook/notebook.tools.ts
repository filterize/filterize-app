import { Notebook } from "./notebook.spec";
import { ignoreDeletedFilter } from "../filterize-ressources/resources.tools";
export const notebookSortKey = (nb: Notebook) =>
  nb.stack
    ? `${nb.stack}: ${nb.name}`
    : nb.name;

export const notebookComparator = (a: Notebook, b: Notebook) => {
  let key_a = notebookSortKey(a);
  let key_b = notebookSortKey(b);
  if (key_a < key_b) return -1;
  else if (key_a > key_b) return 1;
  else return 0;
};

export const notebookSort = (nbs: Notebook[]) => [...nbs].sort(notebookComparator);

export const notebookIgnoreDeleted = (nbs: Notebook[]) => nbs.filter(nb => !nb.deleted);
