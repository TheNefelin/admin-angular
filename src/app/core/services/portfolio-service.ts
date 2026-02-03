import { inject, Injectable } from '@angular/core';
import { ApiResponseService } from '@core/helpers/api-response-service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PortfolioService {
  private apiService = inject(ApiResponseService<any, any>);
  private readonly endpoint = 'portfolio/public-projects';

  getAll(): Observable<any[]> {
    return this.apiService.getAll(this.endpoint);
  }
}
