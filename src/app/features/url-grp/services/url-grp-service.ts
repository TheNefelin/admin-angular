import { inject, Injectable } from '@angular/core';
import { ApiResponseService } from '@core/helpers/api-response-service';
import { Observable } from 'rxjs';
import { UrlGrpModel } from '@features/url-grp/models/url-grp-model';
import { ApiResponseModel } from '@core/models/api-response-model';

@Injectable({
  providedIn: 'root',
})
export class UrlGrpService {
  private apiService = inject(ApiResponseService<ApiResponseModel<UrlGrpModel[]>, UrlGrpModel>);
  private readonly endpoint = 'portfolio/url-grps';

  getAll(): Observable<ApiResponseModel<UrlGrpModel[]>> {
    return this.apiService.getAll(this.endpoint);
  }

  create(urlgrp: UrlGrpModel): Observable<ApiResponseModel<UrlGrpModel>> {
    return this.apiService.create(this.endpoint, urlgrp);
  }

  update(urlgrp: UrlGrpModel): Observable<ApiResponseModel<UrlGrpModel>> {
    return this.apiService.update(this.endpoint, urlgrp);
  }

  delete(id: number): Observable<ApiResponseModel<void>> {
    return this.apiService.delete(this.endpoint, id);
  }
}
