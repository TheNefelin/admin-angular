import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UrlGrpModel } from '@features/url-grp/models/url-grp-model';
import { UrlGrpService } from '@features/url-grp/services/url-grp-service';
import { LoadingComponent } from '@shared/components/loading-component/loading-component';
import { MessageErrorComponent } from '@shared/components/message-error-component/message-error-component';
import { MessageSuccessComponent } from '@shared/components/message-success-component/message-success-component';

/** Extrae el urlgrp del estado de navegación (history.state) pasado por router.navigate(..., { state }) */
function getUrlgrpFromHistoryState(): UrlGrpModel | null {
  const state = history.state as { urlgrp?: UrlGrpModel } | null;
  return state?.urlgrp ?? null;
}

@Component({
  selector: 'app-url-grp-form-page',
  imports: [
    FormsModule,
    RouterLink,
    LoadingComponent,
    MessageErrorComponent,
    MessageSuccessComponent,
  ],
  templateUrl: './url-grp-form-page.html',
})
export class UrlGrpFormPage {
  private readonly urlgrpService = inject(UrlGrpService);
  private readonly router = inject(Router);

  private readonly initialUrlgrp = getUrlgrpFromHistoryState();

  readonly urlgrp = signal<UrlGrpModel | null>(this.initialUrlgrp);
  readonly isEditMode = computed(() => this.urlgrp() !== null);
  readonly formData = signal<Partial<UrlGrpModel>>({
    name: this.initialUrlgrp?.name ?? '',
    isEnable: this.initialUrlgrp?.isEnable ?? true,
  });

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  protected updateName(value: string): void {
    this.formData.update((data) => ({ ...data, name: value }));
    this.errorMessage.set(null);
  }

  protected updateIsEnable(value: boolean): void {
    this.formData.update((data) => ({ ...data, isEnable: value }));
    this.errorMessage.set(null);
  }

  protected onSubmit(): void {
    const data = this.formData();
    const name = (data.name ?? '').trim();

    if (!name) {
      this.errorMessage.set('El nombre es obligatorio');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const payload: UrlGrpModel = this.isEditMode()
      ? { id: this.urlgrp()!.id, name, isEnable: data.isEnable ?? true }
      : { id: 0, name, isEnable: data.isEnable ?? true };

    const request = this.isEditMode()
      ? this.urlgrpService.update(payload)
      : this.urlgrpService.create(payload);

    request.subscribe({
      next: () => {
        this.isLoading.set(false);
        this.successMessage.set(
          this.isEditMode() ? 'Grupo actualizado correctamente' : 'Grupo creado correctamente'
        );
        this.router.navigate(['/url-grp']);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }
}
