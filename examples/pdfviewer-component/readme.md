[![Built With Stencil](https://img.shields.io/badge/-Built%20With%20Stencil-16161d.svg?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjIuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI%2BCjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI%2BCgkuc3Qwe2ZpbGw6I0ZGRkZGRjt9Cjwvc3R5bGU%2BCjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik00MjQuNywzNzMuOWMwLDM3LjYtNTUuMSw2OC42LTkyLjcsNjguNkgxODAuNGMtMzcuOSwwLTkyLjctMzAuNy05Mi43LTY4LjZ2LTMuNmgzMzYuOVYzNzMuOXoiLz4KPHBhdGggY2xhc3M9InN0MCIgZD0iTTQyNC43LDI5Mi4xSDE4MC40Yy0zNy42LDAtOTIuNy0zMS05Mi43LTY4LjZ2LTMuNkgzMzJjMzcuNiwwLDkyLjcsMzEsOTIuNyw2OC42VjI5Mi4xeiIvPgo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNNDI0LjcsMTQxLjdIODcuN3YtMy42YzAtMzcuNiw1NC44LTY4LjYsOTIuNy02OC42SDMzMmMzNy45LDAsOTIuNywzMC43LDkyLjcsNjguNlYxNDEuN3oiLz4KPC9zdmc%2BCg%3D%3D&colorA=16161d&style=flat-square)](https://stenciljs.com)

## PDF Viewer Web Component

This component can view a PDF file online in the browser. [Dynamic Web TWAIN](https://www.dynamsoft.com/web-twain/overview/) is used as the backend. It can also scan documents and save them as a PDF file.

[Online demo](https://tony-xlh.github.io/pdfviewer-component/test.html)

### Usage

In your HTML, add the component:

```html
<pdf-viewer></pdf-viewer>
```

You can define the props as attributes.

```html
<pdf-viewer 
  showthumbnailviewer="true"
  url="./sample.pdf"
></pdf-viewer>
```

You can also do it using JavaScript.

```js
const PDFViewer = document.querySelector('pdf-viewer');
PDFViewer.url = "./sample.pdf";
PDFViewer.showthumbnailviewer = "true";
PDFViewer.uselocalservice = "true"; //use local service to enable document scanning with scanners.
PDFViewer.license = "<your license>"; //otherwise, use a one-day trial
const webTWAINReady = async (e) => {
  DWObject = e.detail;
}
PDFViewer.addEventListener("webTWAINReady",webTWAINReady);
```

## Install this component

### Script tag

- Put a script tag similar to this 

   ```html
   <script type="module">
     import { defineCustomElements } from 'https://cdn.jsdelivr.net/npm/web-component-pdfviewer/dist/esm/loader.js';
     defineCustomElements();
   </script>
   ```
   
   in the head of your index.html
   
- Then you can use the element anywhere in your template, JSX, html etc

### Node Modules
- Run `npm install web-component-pdfviewer --save`
- Put a script tag similar to this 

   ```html
   <script type="module">
     import { defineCustomElements } from 'node_modules/web-component-pdfviewer/dist/esm/loader.js';
     defineCustomElements();
   </script>
   ```
   
   in the head of your index.html
   
- Then you can use the element anywhere in your template, JSX, html etc

### In a stencil-starter app
- Run `npm install web-component-pdfviewer --save`
- Add an import to the npm packages `import web-component-pdfviewer;`
- Then you can use the element anywhere in your template, JSX, html etc
