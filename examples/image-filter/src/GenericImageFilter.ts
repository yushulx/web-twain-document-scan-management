import { ImageFilter } from "./ImageFilter";

export class GenericImageFilter implements ImageFilter {
  cvs:HTMLCanvasElement;
  constructor(cvs:HTMLCanvasElement) {
    this.cvs = cvs;
  }

  process(img:HTMLImageElement|HTMLCanvasElement|HTMLVideoElement){
    let width;
    let height;
    if (img instanceof HTMLImageElement) {
      width = img.naturalWidth;
      height = img.naturalHeight;
    }else if (img instanceof HTMLCanvasElement){
      width = img.width;
      height = img.height;
    }else{
      width = img.videoWidth;
      height = img.videoHeight;
    }
    const context = this.cvs.getContext('2d');
    this.cvs.width = width;
    this.cvs.height = height;
    if (context) {
      context.drawImage(img, 0, 0);
      const imageData = context.getImageData(0, 0, this.cvs.width, this.cvs.height);
      const pixels = imageData.data; //[r,g,b,a,...]
      for (var i = 0; i < pixels.length; i += 4) {
        const red = pixels[i];
        const green = pixels[i + 1];
        const blue = pixels[i + 2];
        const alpha = pixels[i + 3];
        const converted = this.convert(red, green, blue, alpha)
        pixels[i] = converted.r;
        pixels[i + 1] = converted.g;
        pixels[i + 2] = converted.b;
        pixels[i + 3] = converted.a;
      }
      context.putImageData(imageData, 0, 0);
    }
  }

  convert(r:number,g:number,b:number,a:number){
    return {r:r,g:g,b:b,a:a};
  }
}