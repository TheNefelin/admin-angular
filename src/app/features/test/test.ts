import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { PortfolioService } from '@core/services/portfolio-service';
import { catchError, of } from 'rxjs';
import { LoadingComponent } from "@shared/components/loading-component/loading-component";

@Component({
  selector: 'app-test',
  imports: [
    CommonModule,
    LoadingComponent
],
  templateUrl: './test.html',
})
export class Test {
  private portfolioService = inject(PortfolioService);
  
  private portfolioResult = toSignal(
    this.portfolioService.getAll().pipe(
      catchError((err) => {
        console.error('Error cargando libros:', err);
        return of([] as any[]);
      })
    ),
    { initialValue: undefined }
  );

  data = computed(() => this.portfolioResult() ?? []);
  loading = computed(() => this.portfolioResult() === undefined);
}
