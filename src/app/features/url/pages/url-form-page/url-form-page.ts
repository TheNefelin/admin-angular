import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ApiResponseModel } from '@core/models/api-response-model';
import { UrlModel } from '@features/url/models/url-model';
import { UrlUrlgrpModel } from '@features/url/models/url-urlgrp-model';
import { UrlService } from '@features/url/services/url-service';
import { UrlGrpService } from '@features/url-grp/services/url-grp-service';
import { UrlGrpModel } from '@features/url-grp/models/url-grp-model';
import { LoadingComponent } from '@shared/components/loading-component/loading-component';
import { MessageErrorComponent } from '@shared/components/message-error-component/message-error-component';
import { MessageSuccessComponent } from '@shared/components/message-success-component/message-success-component';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { FormsModule } from '@angular/forms';

function getUrlFromHistoryState(): UrlUrlgrpModel | null {
  const state = history.state as { url?: UrlUrlgrpModel } | null;
  return state?.url ?? null;
}

@Component({
  selector: 'app-url-form-page',
  imports: [
    RouterLink,
    LoadingComponent,
    MessageErrorComponent,
    MessageSuccessComponent,
    FormsModule,
  ],
  templateUrl: './url-form-page.html',
})
export class UrlFormPage {
  private readonly urlService = inject(UrlService);
  private readonly urlgrpService = inject(UrlGrpService);
  private readonly router = inject(Router);

  private readonly initialUrl = getUrlFromHistoryState();

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

  readonly url = signal<UrlUrlgrpModel | null>(this.initialUrl);
  readonly isEditMode = computed(() => this.url() !== null);
  readonly urlgrpList = computed(() => this.urlgrpSignal()?.data ?? []);

  readonly formData = signal<Partial<UrlModel>>({
    name: this.initialUrl?.name ?? '',
    link: this.initialUrl?.link ?? '',
    isEnable: this.initialUrl?.isEnable ?? true,
    id_UrlGrp: this.initialUrl?.UrlGrp?.id ?? 0,
  });

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  protected updateName(value: string): void {
    this.formData.update((data) => ({ ...data, name: value }));
    this.errorMessage.set(null);
  }

  protected updateLink(value: string): void {
    this.formData.update((data) => ({ ...data, link: value }));
    this.errorMessage.set(null);
  }

  protected updateIsEnable(value: boolean): void {
    this.formData.update((data) => ({ ...data, isEnable: value }));
    this.errorMessage.set(null);
  }

  protected updateIdUrlGrp(value: number): void {
    this.formData.update((data) => ({ ...data, id_UrlGrp: value }));
    this.errorMessage.set(null);
  }

  protected onSubmit(): void {
    const data = this.formData();
    const name = (data.name ?? '').trim();
    const link = (data.link ?? '').trim();

    if (!name) {
      this.errorMessage.set('El nombre es obligatorio');
      return;
    }

    if (!link) {
      this.errorMessage.set('El enlace es obligatorio');
      return;
    }

    const id_UrlGrp = data.id_UrlGrp ?? 0;
    if (id_UrlGrp === 0) {
      this.errorMessage.set('Debe seleccionar un grupo');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const payload: UrlModel = this.isEditMode()
      ? {
          id: this.url()!.id,
          name,
          link,
          isEnable: data.isEnable ?? true,
          id_UrlGrp,
        }
      : {
          id: 0,
          name,
          link,
          isEnable: data.isEnable ?? true,
          id_UrlGrp,
        };

    const request = this.isEditMode()
      ? this.urlService.update(payload)
      : this.urlService.create(payload);

    request.subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.isSuccess) {
          this.successMessage.set(
            this.isEditMode() ? 'Url actualizada correctamente' : 'Url creada correctamente'
          );
          setTimeout(() => this.router.navigate(['/url']), 1500);
        } else {
          this.errorMessage.set(res.message ?? 'Error al procesar la solicitud');
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err?.message ?? 'Error de conexión. Intenta de nuevo.');
      },
    });
  }
}
