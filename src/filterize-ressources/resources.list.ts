import { notebookReducer } from "../notebook/notebook.reducer";
export const USER_RESOURCES = {
  filter: {
    action_prefix: "FILTER",
    store: "filters",
    path: "/filters",
    id: "guid",
    personal: true,
    business: true
  },
  tag: {
    action_prefix: "TAG",
    store: "tags",
    path: "/tags",
    id: "guid",
    personal: true,
    business: true,
    icon: "pricetag",
    title: {
      "default": "tag",
      "de": "Schlagwort"
    }
  },
  notebook: {
    action_prefix: "NOTEBOOK",
    store: "notebooks",
    path: "/notebooks",
    id: "guid",
    personal: true,
    business: true,
    reducer: notebookReducer,
    icon: "book",
    title: {
      "default": "notebook",
      "de": "Notizbuch"
    }
  }
};

export const GLOBAL_RESOURCES = [
  {
    path: "/global/server_time",
    action_prefix: "TIME",
    name: null
  },
  {
    path: "/global/country_divisions",
    action_prefix: "COUNTRY_DEVISIONS",
    name: "country_devisions"
  },
  {
    path: "/global/countries",
    action_prefix: "COUNTRIES",
    name: "countries"
  },
  {
    path: "/global/actions",
    action_prefix: "ACTIONS",
    name: "actions"
  },
  {
    path: "/global/conditions",
    action_prefix: "CONDITIONS",
    name: "conditions"
  }
];
