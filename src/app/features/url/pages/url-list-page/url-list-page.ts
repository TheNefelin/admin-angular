import { Component, computed, inject, resource, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ApiResponseModel } from '@core/models/api-response-model';
import { UrlModel } from '@features/url/models/url-model';
import { UrlUrlgrpModel } from '@features/url/models/url-urlgrp-model';
import { UrlService } from '@features/url/services/url-service';
import { catchError, firstValueFrom, of } from 'rxjs';
import { LoadingComponent } from '@shared/components/loading-component/loading-component';
import { MessageErrorComponent } from '@shared/components/message-error-component/message-error-component';
import { UrlGrpService } from '@features/url-grp/services/url-grp-service';
import { toSignal } from '@angular/core/rxjs-interop';
import { UrlGrpModel } from '@features/url-grp/models/url-grp-model';

@Component({
  selector: 'app-url-list-page',
  imports: [LoadingComponent, MessageErrorComponent],
  templateUrl: './url-list-page.html',
})
export class UrlListPage {
  private urlgrpService = inject(UrlGrpService);
  private urlService = inject(UrlService);
  private router = inject(Router);

  private readonly urlgrpSignal = toSignal(
    this.urlgrpService.getAll().pipe(
      catchError((err) => {
        console.error('Error cargando grupos:', err);
        return of({
          isSuccess: false,
          statusCode: 500,
          message: err?.message ?? 'Error 500',
          data: []
        } as ApiResponseModel<UrlGrpModel[]>);
      })
    ),
    { initialValue: undefined }
  );

  private readonly urlResource = resource({
    loader: async () => {
      return firstValueFrom(
        this.urlService.getAll().pipe(
          catchError((err) => {
            console.error('Error cargando urls:', err);
            return of({
              isSuccess: false,
              statusCode: 500,
              message: err?.message ?? 'Error 500',
              data: []
            } as ApiResponseModel<UrlModel[]>);
          })
        )
      );
    }
  });

  readonly urlgrpResult = computed(() => this.urlgrpSignal()?.data ?? []);
  readonly urlResult = computed(() => this.urlResource.hasValue() ? this.urlResource.value() : undefined);
  readonly loading = computed(() => this.urlResource.isLoading() || this.urlgrpSignal() === undefined);

  readonly selectedFilterId = signal(0);

  private readonly urlsWithGrp = computed((): UrlUrlgrpModel[] => {
    const urls = this.urlResult()?.data ?? [];
    const groups = this.urlgrpResult();
    const groupById = new Map(groups.map((g) => [g.id, g]));
    return urls.map((url) => ({
      id: url.id,
      name: url.name,
      link: url.link,
      isEnable: url.isEnable,
      UrlGrp: groupById.get(url.id_UrlGrp) ?? 
      { 
        id: url.id_UrlGrp, 
        name: '', 
        isEnable: false 
      }
    }));
  });

  readonly filteredUrls = computed(() => {
    const data = this.urlsWithGrp();
    const id = this.selectedFilterId();
    if (id === 0) return data;
    return data.filter((u) => u.UrlGrp?.id === id);
  });

  onCreate() {
    this.router.navigate(['url', 'form']);
  }

  onEdit(item: UrlUrlgrpModel) {
    this.router.navigate(['url', 'form'], { state: { url: item } });
  }

  onDelete(item: UrlUrlgrpModel) {
    this.urlService.delete(item.id).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.urlResource.reload();
        }
      }
    });
  }

  onFilter(id: number): void {
    this.selectedFilterId.set(id);
  }
}
