# DocumentScanner

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 13.3.7.

The project is a progressive web app demo of [Dynamic Web TWAIN](https://www.dynamsoft.com/web-twain/overview/). It can scan documents from scanners.

[Online demo](https://strong-kringle-2a01b8.netlify.app/)

## Trial License

You need a license to use Dynamic Web TWAIN. You can apply for one [here](https://www.dynamsoft.com/customer/license/trialLicense/?product=dwt) and use it in `app.component.html`.

```html
<app-document-viewer 
license="your trial license"
(onWebTWAINReady)="onWebTWAINReady($event)">
</app-document-viewer>
```

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
