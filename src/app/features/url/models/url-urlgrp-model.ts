import { UrlGrpModel } from "@features/url-grp/models/url-grp-model";

export interface UrlUrlgrpModel {
  id: number,
  name: string,
  link: string,
  isEnable: boolean,
  UrlGrp: UrlGrpModel
}
