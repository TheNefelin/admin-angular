import { inject, Injectable } from '@angular/core';
import { ApiResponseService } from '@core/helpers/api-response-service';
import { ApiResponseModel } from '@core/models/api-response-model';
import { UrlModel } from '@features/url/models/url-model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UrlService {
  private apiService = inject(ApiResponseService<ApiResponseModel<UrlModel[]>, UrlModel>);
  private readonly endpoint = 'portfolio/urls';
 
  getAll(): Observable<ApiResponseModel<UrlModel[]>> {
    return this.apiService.getAll(this.endpoint);
  }

  create(urlgrp: UrlModel): Observable<ApiResponseModel<UrlModel>> {
    return this.apiService.create(this.endpoint, urlgrp);
  }

  update(urlgrp: UrlModel): Observable<ApiResponseModel<UrlModel>> {
    return this.apiService.update(this.endpoint, urlgrp);
  }

  delete(id: number): Observable<ApiResponseModel<void>> {
    return this.apiService.delete(this.endpoint, id);
  }
}
