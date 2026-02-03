# Admin Angular 21

### Dependencies
- [DaisyUI](https://daisyui.com/)

### Structure
```
```

## Routes
- tsconfig.app.json
```json
{
  "compilerOptions": {
    "baseUrl": "./src",
    "paths": {
      "@core/*": ["app/core/*"],
      "@layouts/*": ["app/layouts/*"],
      "@shared/*": ["app/shared/*"],
      "@features/*": ["app/features/*"],
    }
  }
}
```
- fetures/my-feature/my-feature.routes.ts
```ts
export const MY_FEATURE_ROUTES: Routes = [
  {
    path: '',
    component: MyFeature,
  },
]
```
- app.routes.ts
```ts
export const routes: Routes = [
	{
		path: '',
		component: MainLayout,
    loadChildren: () => import('@features/my-feature/my-feature.routes').then(m => m.MY_FEATURE_ROUTES),
	}
];
```

```sh
ng g interface core/models/api-response-model
ng g s core/helpers/api-response-service --skip-tests
ng g s core/services/portfolio-service --skip-tests

ng g c layouts/main-layout --skip-tests --style=none
ng g c features/home/pages/home-page --skip-tests --style=none

ng g interface features/url/models/url-model
ng g interface features/url/models/url-urlgrp-model
ng g s features/url/services/url-service --skip-tests
ng g c features/url/pages/url-list-page --skip-tests --style=none
ng g c features/url/pages/url-form-page --skip-tests --style=none

ng g interface features/url-grp/models/url-grp-model
ng g s features/url-grp/services/url-grp-service --skip-tests
ng g c features/url-grp/pages/url-grp-list-page --skip-tests --style=none
ng g c features/url-grp/pages/url-grp-form-page --skip-tests --style=none

ng g c features/not-found --skip-tests --style=none
ng g c features/test --skip-tests --style=none

ng g interface shared/models/navigation-model
ng g c shared/components/loading-component --skip-tests --style=none
ng g c shared/components/message-success-component --skip-tests --style=none
ng g c shared/components/message-error-component --skip-tests --style=none
```

---
---
---
---
---

# AdminAngular

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.1.2.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
