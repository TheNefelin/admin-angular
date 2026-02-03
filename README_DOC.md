# Guía de desarrollo — Angular 21

Este documento describe las prácticas y características de **Angular 21** utilizadas en el proyecto, para usarlo como referencia al crear o mantener aplicaciones con el mismo estándar.

---

## Índice

1. [Estructura del proyecto](#1-estructura-del-proyecto)
2. [Configuración de la aplicación](#2-configuración-de-la-aplicación)
3. [Paths y alias](#3-paths-y-alias)
4. [Standalone components](#4-standalone-components)
5. [Inyección de dependencias con `inject()`](#5-inyección-de-dependencias-con-inject)
6. [Signals](#6-signals)
7. [toSignal — Integración RxJS](#7-tosignal--integración-rxjs)
8. [resource() — Carga asíncrona declarativa](#8-resource--carga-asíncrona-declarativa)
9. [Control flow en plantillas](#9-control-flow-en-plantillas)
10. [Inputs con `input()` e `input.required()`](#10-inputs-con-input-e-inputrequired)
11. [Formularios con signals](#11-formularios-con-signals)
12. [Interceptors HTTP](#12-interceptors-http)
13. [Servicios y API](#13-servicios-y-api)
14. [Modelo de respuesta API y notificaciones](#14-modelo-de-respuesta-api-y-notificaciones)
15. [Routing y lazy loading](#15-routing-y-lazy-loading)
16. [Resumen de buenas prácticas](#16-resumen-de-buenas-prácticas)

---

## 1. Estructura del proyecto

```
src/app/
├── app.config.ts          # Configuración global (providers, router, http, interceptors)
├── app.routes.ts          # Rutas raíz y layout principal
├── core/                  # Singleton, servicios globales, interceptors, modelos compartidos
│   ├── helpers/           # Servicios base (ej. ApiResponseService)
│   ├── interceptors/      # Interceptors HTTP (ej. api-response.interceptor)
│   ├── models/            # Interfaces compartidas (ej. ApiResponseModel)
│   └── services/         # Servicios de aplicación (NotificationService, etc.)
├── features/              # Módulos por funcionalidad (url, url-grp, home, etc.)
│   └── [feature]/
│       ├── models/        # Modelos de la feature
│       ├── pages/         # Páginas (list, form, etc.)
│       ├── services/      # Servicios de la feature
│       └── [feature].routes.ts
├── layouts/               # Layouts (main-layout con sidebar, etc.)
└── shared/                # Componentes, constantes y modelos reutilizables
    ├── components/
    └── constants/
```

- **core**: lógica y configuración que existe una sola vez en la app.
- **features**: una carpeta por dominio/funcionalidad, con sus rutas, páginas y servicios.
- **layouts**: estructuras de página (con o sin sidebar, header, etc.).
- **shared**: componentes y utilidades reutilizables entre features.

---

## 2. Configuración de la aplicación

**Archivo:** `app.config.ts`

```typescript
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([apiResponseInterceptor])),
  ],
};
```

- **provideBrowserGlobalErrorListeners()**: captura errores no manejados en el navegador.
- **provideRouter(routes)**: configura el router con las rutas.
- **provideHttpClient(withInterceptors([...]))**: configura `HttpClient` con **interceptors funcionales** (recomendado en Angular 21 frente a interceptors por DI).

No se usa `NgModule`; toda la configuración es por **providers** en `ApplicationConfig`.

---

## 3. Paths y alias

**Archivo:** `tsconfig.app.json`

```json
{
  "compilerOptions": {
    "baseUrl": "./src",
    "paths": {
      "@core/*": ["app/core/*"],
      "@features/*": ["app/features/*"],
      "@layouts/*": ["app/layouts/*"],
      "@shared/*": ["app/shared/*"]
    }
  }
}
```

Uso en imports:

```typescript
import { ApiResponseModel } from '@core/models/api-response-model';
import { UrlService } from '@features/url/services/url-service';
import { MainLayout } from '@layouts/main-layout/main-layout';
import { LoadingComponent } from '@shared/components/loading-component/loading-component';
```

Ventajas: imports más cortos, menos `../../../` y refactors más sencillos.

---

## 4. Standalone components

Todos los componentes son **standalone**: no declaran `NgModule`, solo se importan en otros componentes o en rutas.

```typescript
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
export class UrlFormPage { }
```

- **imports**: directivas, otros componentes y módulos que necesita la plantilla.
- No hay `standalone: true` explícito porque en Angular 21 es el valor por defecto para componentes nuevos.

---

## 5. Inyección de dependencias con `inject()`

Se usa **`inject()`** en lugar de inyección por constructor.

```typescript
export class UrlFormPage {
  private readonly urlService = inject(UrlService);
  private readonly urlgrpService = inject(UrlGrpService);
  private readonly router = inject(Router);
}
```

Reglas:

- Solo se puede llamar a `inject()` en **contexto de inyección** (constructor, field initializer, `runInInjectionContext`).
- Orden de declaración no importa; el orden de resolución lo define el framework.
- Mantener dependencias como `private readonly` cuando no se exponen al template.

---

## 6. Signals

Los **signals** son la base del estado reactivo en Angular 21.

### Crear y leer

```typescript
readonly count = signal(0);
readonly name = signal<string | null>(null);
```

En la plantilla se **invocan** como funciones: `count()`, `name()`.

### Actualizar

```typescript
this.count.set(5);
this.formData.update((prev) => ({ ...prev, name: value }));
```

- **set(value)**: reemplaza el valor.
- **update(fn)**: calcula el nuevo valor a partir del anterior (útil para objetos inmutables).

### Computed

```typescript
readonly isEditMode = computed(() => this.url() !== null);
readonly urlgrpList = computed(() => this.urlgrpSignal()?.data ?? []);
readonly filteredUrls = computed(() => {
  const data = this.urlsWithGrp();
  const id = this.selectedFilterId();
  if (id === 0) return data;
  return data.filter((u) => u.UrlGrp?.id === id);
});
```

- **computed** deriva un valor a partir de otros signals; se recalcula solo cuando cambian sus dependencias.
- En plantillas se usan igual: `isEditMode()`, `filteredUrls()`.

### Uso típico en formularios

- Un **signal** para el modelo del formulario (`formData`).
- **computed** para estado derivado (`isEditMode`, listas filtradas).
- **signals** para UI: `isLoading`, `errorMessage`, `successMessage`.

---

## 7. toSignal — Integración RxJS

**`toSignal`** convierte un `Observable` en un **Signal** (desde `@angular/core/rxjs-interop`).

```typescript
import { toSignal } from '@angular/core/rxjs-interop';

private readonly urlgrpSignal = toSignal(
  this.urlgrpService.getAll().pipe(
    catchError((err) => {
      console.error('Error cargando grupos:', err);
      return of({ isSuccess: false, statusCode: 500, message: err?.message ?? 'Error 500', data: [] });
    })
  ),
  { initialValue: undefined }
);

readonly urlgrpList = computed(() => this.urlgrpSignal()?.data ?? []);
```

- **initialValue**: valor del signal hasta que el Observable emita (evita `undefined` en plantilla si se maneja).
- El signal se actualiza con cada emisión y deja de seguir al Observable cuando el componente se destruye (evita fugas de memoria).
- Ideal para **una sola fuente de datos** por Observable (listas, opciones, etc.) que quieras consumir como signal en plantilla o en `computed`.

---

## 8. resource() — Carga asíncrona declarativa

**`resource()`** (Angular 17+) permite cargar datos de forma asíncrona y exponer estado **loading / value / error** como signals.

```typescript
import { resource } from '@angular/core';

private readonly urlResource = resource({
  loader: async () => {
    return firstValueFrom(
      this.urlService.getAll().pipe(
        catchError((err) => {
          console.error('Error cargando urls:', err);
          return of({ isSuccess: false, statusCode: 500, message: err?.message ?? 'Error 500', data: [] });
        })
      )
    );
  }
});

readonly urlResult = computed(() => this.urlResource.hasValue() ? this.urlResource.value() : undefined);
readonly loading = computed(() => this.urlResource.isLoading() || this.urlgrpSignal() === undefined);
```

En plantilla:

```html
@if (loading()) {
  <app-loading-component/>
} @else {
  @if (urlResult()?.isSuccess) {
    <!-- tabla con datos -->
  } @else {
    <app-message-error-component [message]="urlResult()!.message"/>
  }
}
```

Recarga (por ejemplo tras borrar):

```typescript
this.urlService.delete(item.id).subscribe({
  next: () => this.urlResource.reload(),
});
```

- **loader**: función async que devuelve la data (aquí con `firstValueFrom` + Observable).
- **resource()** expone: `.value()`, `.hasValue()`, `.isLoading()`, `.error()`, `.reload()`.
- Muy adecuado para **páginas de listado** que cargan una vez y pueden recargar.

---

## 9. Control flow en plantillas

Se usa la **nueva sintaxis de control flow** (`@if`, `@for`, `@switch`) en lugar de `*ngIf`, `*ngFor`, `*ngSwitch`.

### @if

```html
@if (errorMessage()) {
  <app-message-error-component [message]="errorMessage()!" class="m-4" />
}
@if (isLoading()) {
  <app-loading-component />
} @else {
  <button type="submit" class="btn btn-primary">Guardar</button>
}
```

### @for

```html
@for (grp of urlgrpList(); track grp.id) {
  <option [value]="grp.id">{{ grp.name }}</option>
}
@for (item of filteredUrls(); track item.id) {
  <tr>...</tr>
}
```

- **track** es obligatorio en `@for` para un rendimiento óptimo (identificador estable por elemento).
- Menos directivas en el template y mejor integración con signals.

---

## 10. Inputs con `input()` e `input.required()`

En lugar de `@Input()`, se usan **input()** e **input.required()** (API basada en signals).

```typescript
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-message-error-component',
  standalone: true,
  templateUrl: './message-error-component.html',
})
export class MessageErrorComponent {
  message = input.required<string>();
}
```

En plantilla:

```html
<span>{{ message() }}</span>
```

- **input.required<string>()**: el valor es obligatorio; el tipo del signal es `string`.
- **input<string>()**: opcional; el tipo puede ser `string | undefined`.
- En el template los inputs se leen como funciones: `message()`.

---

## 11. Formularios con signals

En este proyecto los formularios no usan `FormGroup`/`FormControl`; el estado se lleva con **signals** y enlaces manuales.

### Estado del formulario

```typescript
readonly formData = signal<Partial<UrlModel>>({
  name: this.initialUrl?.name ?? '',
  link: this.initialUrl?.link ?? '',
  isEnable: this.initialUrl?.isEnable ?? true,
  id_UrlGrp: this.initialUrl?.UrlGrp?.id ?? 0,
});
```

### Actualización por campo

```typescript
protected updateName(value: string): void {
  this.formData.update((data) => ({ ...data, name: value }));
  this.errorMessage.set(null);
}
```

### En la plantilla: binding unidireccional

```html
<input
  [value]="formData().name"
  (input)="updateName($any($event.target).value)"
/>
<select
  [value]="formData().id_UrlGrp"
  (change)="updateIdUrlGrp(+$any($event.target).value)"
>
```

- Se usa **FormsModule** para `ngSubmit` y directivas de formulario, pero el modelo es un **signal**.
- Validación manual en `onSubmit()` y mensajes con `errorMessage`/`successMessage` (signals).
- Patrón claro y fácil de seguir cuando no necesitas validadores reactivos complejos.

### Envío y respuesta API

```typescript
const payload: UrlModel = this.isEditMode() ? { id: this.url()!.id, ... } : { id: 0, ... };
const request = this.isEditMode() ? this.urlService.update(payload) : this.urlService.create(payload);

request.subscribe({
  next: () => {
    this.isLoading.set(false);
    this.successMessage.set('...');
    setTimeout(() => this.router.navigate(['/url']), 1500);
  },
  error: () => {
    this.isLoading.set(false);
    // El interceptor ya muestra el error en el dialog global
  },
});
```

---

## 12. Interceptors HTTP

Se usan **interceptors funcionales** (`HttpInterceptorFn`) registrados con **withInterceptors()**.

### Definición

**Archivo:** `core/interceptors/api-response.interceptor.ts`

```typescript
import { HttpErrorResponse, HttpInterceptorFn, HttpStatusCode, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, of, switchMap, throwError } from 'rxjs';
import { NotificationService } from '@core/services/notification.service';

export const apiResponseInterceptor: HttpInterceptorFn = (req, next) => {
  const notification = inject(NotificationService);

  return next(req).pipe(
    switchMap((event) => {
      if (!(event instanceof HttpResponse)) return of(event);
      const body = event.body;
      // Si el backend devuelve 200 pero isSuccess: false, tratarlo como error
      if (!isApiResponseBody(body) || body.isSuccess) return of(event);

      const message = body.message ?? 'Error al procesar la solicitud';
      const statusCode = body.statusCode ?? HttpStatusCode.BadRequest;
      notification.showError(message);
      return throwError(() => new HttpErrorResponse({ error: body, status: statusCode }));
    }),
    catchError((err: unknown) => {
      const message = err instanceof HttpErrorResponse
        ? (err.error?.message ?? err.message) || 'Error de conexión'
        : err instanceof Error ? err.message : 'Error inesperado';
      notification.showError(message);
      return throwError(() => err);
    })
  );
};
```

### Qué hace

1. **Respuestas 2xx con `isSuccess: false`**: las convierte en error (notificación + `HttpErrorResponse`), para que en los componentes solo se maneje el callback `error` del `subscribe`.
2. **Cualquier error** (red o ya convertido): muestra el mensaje en el **NotificationService** (dialog global) y re-lanza el error.

### Buenas prácticas

- No usar `statusText` (deprecado en HTTP/2).
- Usar `throwError(() => new HttpErrorResponse(...))` (función factory).
- Los interceptors funcionales pueden usar `inject()` dentro del contexto de ejecución del interceptor.

---

## 13. Servicios y API

### Servicio base genérico

**Archivo:** `core/helpers/api-response-service.ts`

```typescript
@Injectable({ providedIn: 'root' })
export class ApiResponseService<R, T> {
  private http = inject(HttpClient);

  getAll(endpoint: string): Observable<R> {
    return this.http.get<R>(`${this.apiUrl}/${endpoint}`, { headers: this.getHeaders() });
  }
  create(endpoint: string, data: T): Observable<R> { ... }
  update(endpoint: string, data: T): Observable<R> { ... }
  delete(endpoint: string, id: string | number): Observable<R> { ... }
}
```

- **R**: tipo de respuesta (ej. `ApiResponseModel<UrlModel[]>`).
- **T**: tipo del body en create/update.
- Headers (ApiKey, Content-Type) centralizados en un solo lugar.

### Servicio por feature

```typescript
@Injectable({ providedIn: 'root' })
export class UrlService {
  private apiService = inject(ApiResponseService<ApiResponseModel<UrlModel[]>, UrlModel>);
  private readonly endpoint = 'portfolio/urls';

  getAll(): Observable<ApiResponseModel<UrlModel[]>> {
    return this.apiService.getAll(this.endpoint);
  }
  create(urlgrp: UrlModel): Observable<ApiResponseModel<UrlModel>> { ... }
  update(urlgrp: UrlModel): Observable<ApiResponseModel<UrlModel>> { ... }
  delete(id: number): Observable<ApiResponseModel<void>> { ... }
}
```

- Cada feature tiene su servicio que usa el helper genérico y expone métodos tipados.
- Inyección con **inject()**, sin constructor.

---

## 14. Modelo de respuesta API y notificaciones

### ApiResponseModel

**Archivo:** `core/models/api-response-model.ts`

```typescript
export interface ApiResponseModel<T> {
  isSuccess: boolean;
  statusCode: number;
  message: string;
  data: T;
}
```

- Todas las respuestas del backend se asumen con esta forma.
- El **interceptor** trata `isSuccess: false` como error y muestra el `message` en el dialog.

### NotificationService

**Archivo:** `core/services/notification.service.ts`

```typescript
@Injectable({ providedIn: 'root' })
export class NotificationService {
  readonly current = signal<NotificationState | null>(null);

  showError(message: string): void {
    this.current.set({ type: 'error', message });
  }
  showSuccess(message: string): void {
    this.current.set({ type: 'success', message });
  }
  close(): void {
    this.current.set(null);
  }
}
```

- Estado con **signal**; un componente global (p. ej. `NotificationDialogComponent`) lee `current()` y muestra un modal.
- El **interceptor** llama a `showError()`; los componentes pueden llamar a `showSuccess()` o `showError()` cuando lo necesiten.

---

## 15. Routing y lazy loading

### Rutas raíz

**Archivo:** `app.routes.ts`

```typescript
export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      { path: '', loadChildren: () => import('@features/home/home.routes').then(m => m.HOME_ROUTES) },
      { path: 'url-grp', loadChildren: () => import('@features/url-grp/url-grp.routes').then(m => m.URL_GRP_ROUTES) },
      { path: 'url', loadChildren: () => import('@features/url/url.routes').then(m => m.URL_ROUTES) },
      { path: 'test', component: Test },
    ]
  },
  { path: '**', component: NotFound },
];
```

- **loadChildren** + `import()`: lazy loading por feature.
- Rutas de la feature en archivos como `url.routes.ts`, `url-grp.routes.ts`.

### Rutas de feature

**Archivo:** `features/url/url.routes.ts`

```typescript
export const URL_ROUTES: Routes = [
  { path: '', component: UrlListPage },
  { path: 'form', component: UrlFormPage },
];
```

### Navegación con estado

```typescript
this.router.navigate(['/url', 'form'], { state: { url: item } });
```

En la página de formulario:

```typescript
function getUrlFromHistoryState(): UrlUrlgrpModel | null {
  const state = history.state as { url?: UrlUrlgrpModel } | null;
  return state?.url ?? null;
}
private readonly initialUrl = getUrlFromHistoryState();
```

- Útil para pasar el ítem a editar sin ponerlo en la URL ni en un servicio global.

### RouterLink

En plantillas se usa la directiva **RouterLink** (importada en el componente standalone):

```html
<button routerLink="/url" class="btn btn-primary">Volver</button>
<a [routerLink]="item.route">...</a>
```

---

## 16. Resumen de buenas prácticas

| Área | Práctica en este proyecto |
|------|---------------------------|
| **Configuración** | `ApplicationConfig` con `provideRouter`, `provideHttpClient(withInterceptors(...))`, sin NgModules para app. |
| **Componentes** | Standalone, imports explícitos en el array `imports` del `@Component`. |
| **DI** | `inject()` en lugar de constructor para servicios y Router. |
| **Estado** | Signals para estado local y derivado (`computed`); evitar estado mutable en propiedades. |
| **RxJS en UI** | `toSignal()` para un Observable → signal; `resource()` para carga async con loading/value/error. |
| **Plantillas** | Control flow `@if`, `@for` con `track`; inputs como `input()` / `input.required()`. |
| **Formularios** | Modelo en signal, actualización con `update()`, validación en submit, mensajes con signals. |
| **HTTP** | Interceptor funcional que unifica errores de negocio y muestra notificaciones; no usar `statusText`. |
| **API** | Servicio genérico `ApiResponseService<R,T>`; servicios por feature que lo usan; `ApiResponseModel<T>`. |
| **Estructura** | core / features / layouts / shared; paths alias `@core`, `@features`, `@layouts`, `@shared`. |
| **Routing** | Lazy loading por feature con `loadChildren`; estado de navegación con `router.navigate(..., { state })`. |

Usando esta guía y los ejemplos del código podrás mantener la coherencia y el nivel de calidad en nuevos desarrollos Angular 21.
