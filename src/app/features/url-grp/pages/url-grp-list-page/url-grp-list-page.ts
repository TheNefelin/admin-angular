import { Component, computed, inject, resource } from '@angular/core';
import { Router } from '@angular/router';
import { ApiResponseModel } from '@core/models/api-response-model';
import { UrlGrpModel } from '@features/url-grp/models/url-grp-model';
import { UrlGrpService } from '@features/url-grp/services/url-grp-service';
import { LoadingComponent } from '@shared/components/loading-component/loading-component';
import { MessageErrorComponent } from '@shared/components/message-error-component/message-error-component';
import { firstValueFrom } from 'rxjs';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-url-grp-list-page',
  imports: [
    LoadingComponent,
    MessageErrorComponent,
  ],
  templateUrl: './url-grp-list-page.html',
})
export class UrlGrpListPage {
  private readonly urlgrpService = inject(UrlGrpService);
  private readonly router = inject(Router);

  private readonly urlgrpResource = resource({
    loader: async () => {
      return firstValueFrom(
        this.urlgrpService.getAll().pipe(
          catchError((err) => {
            console.error('Error cargando url groups:', err);
            return of({
              isSuccess: false,
              statusCode: 500,
              message: err?.message ?? 'Error 500',
              data: []
            } as ApiResponseModel<UrlGrpModel[]>);
          })
        )
      );
    }
  });

  readonly result = computed(() =>
    this.urlgrpResource.hasValue() ? this.urlgrpResource.value() : undefined
  );
  readonly loading = computed(() => this.urlgrpResource.isLoading());

  onCreate() {
    this.router.navigate(['url-grp', 'form']);
  }

  onEdit(item: UrlGrpModel) {
    this.router.navigate(['url-grp', 'form'], { state: { urlgrp: item } });
  }

  onDelete(item: UrlGrpModel) {
    this.urlgrpService.delete(item.id).subscribe({
      next: () => this.urlgrpResource.reload(),
    });
  }
}
