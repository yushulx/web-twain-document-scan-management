# Image-Converter

![version](https://img.shields.io/npm/v/batch-image-converter.svg)
![downloads](https://img.shields.io/npm/dm/batch-image-converter.svg)
![jsdelivr](https://img.shields.io/jsdelivr/npm/hm/batch-image-converter.svg)

Convert images files in the browser with [Dynamic Web TWAIN](https://www.dynamsoft.com/web-twain/overview).

It can convert images in bmp, jpeg, png, tiff and pdf to images in jpeg, png, tiff and pdf. It runs purely in the browser.

You can select multiple images or load multiple images from a zip file. You can export the images one by one or in a zip file.

[Online demo](https://tony-xlh.github.io/Image-Converter/)

## Installation

1. Via CDN:

   ```html
   <script type="module">
     import { ImageConverter } from 'https://unpkg.com/batch-image-converter/dist/image-converter.js';
     window.onload = function(){
       let container = document.querySelector('#app');
       new ImageConverter({container:container});
     }
   </script>
   <link href="https://unpkg.com/batch-image-converter/dist/style.css" rel="stylesheet">
   ```

2. Via NPM:

   ```bash
   npm install batch-image-converter
   ```
   
## Usage

1. Bind the built-in UI to a container.

   ```js
   let container = document.querySelector('#app');
   new ImageConverter({container:container});
   ```

2. Use the `convert` method to convert a file to the desired format.

   ```js
   let files = await imageConverter.convert(file,ImageFormat.JPG);
   ```

## Product License

You need to pass a license for Dynamic Web TWAIN. You can apply for one [here](https://www.dynamsoft.com/customer/license/trialLicense?product=dwt).

```js
new ImageConverter({license:"your license"});
```




