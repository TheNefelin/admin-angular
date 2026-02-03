import { NavigationModel } from "@shared/models/navigation-model";
import { NAVIGATION_ROUTES } from "./navigation-routes-constant";

export const NAVIGATION_DASHBOARD: NavigationModel[] = [
  {
    route: NAVIGATION_ROUTES.HOME.URI,
    tooltip: NAVIGATION_ROUTES.HOME.NAME
  },
  {
    route: NAVIGATION_ROUTES.URL_GRP.URI,
    tooltip: NAVIGATION_ROUTES.URL_GRP.NAME
  },   
  {
    route: NAVIGATION_ROUTES.URL.URI,
    tooltip: NAVIGATION_ROUTES.URL.NAME
  },
  {
    route: NAVIGATION_ROUTES.TEST.URI,
    tooltip: NAVIGATION_ROUTES.TEST.NAME
  },   
]