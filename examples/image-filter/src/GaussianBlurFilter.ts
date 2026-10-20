import { GenericImageFilter } from "./GenericImageFilter";

export class GaussianBlurFilter extends GenericImageFilter {
  radius:number = 127;
  constructor(cvs:HTMLCanvasElement,radius:number){
    super(cvs);
    this.radius = radius;
  }

  process(img:HTMLImageElement|HTMLCanvasElement|HTMLVideoElement) {
    let width;
    let height;
    if (img instanceof HTMLImageElement) {
      width = img.naturalWidth;
      height = img.naturalHeight;
    }else if(img instanceof HTMLCanvasElement){
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
      let imageData = context.getImageData(0, 0, this.cvs.width, this.cvs.height);
      imageData = this.applyGaussianBlur(imageData, this.radius);
      context.putImageData(imageData, 0, 0);
    }
  }

  applyGaussianBlur(imageData:ImageData, radius:number) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    const kernel = this.createGaussianKernel(radius);

    // horizontal blur
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          this.applyKernel(data, kernel, x, y, width, height, true);
        }
    }

    // vertical blur
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            this.applyKernel(data, kernel, x, y, width, height, false);
        }
    }

    return imageData;
  }

  createGaussianKernel(radius:number) {
    const sigma = radius / 3;
    const kernel = [];
    let sum = 0;

    for (let x = -radius; x <= radius; x++) {
        const g = Math.exp(-(x * x) / (2 * sigma * sigma)) / (Math.sqrt(2 * Math.PI) * sigma);
        kernel.push(g);
        sum += g;
    }

    // normalize
    for (let i = 0; i < kernel.length; i++) {
        kernel[i] /= sum;
    }

    return kernel;
  }

  applyKernel(data:Uint8ClampedArray, kernel:number[], x:number, y:number, width:number, height:number, horizontal: boolean) {
    let r = 0, g = 0, b = 0, a = 0;
    const radius = (kernel.length - 1) / 2;

    for (let i = -radius; i <= radius; i++) {
        const xi = horizontal ? x + i : x;
        const yi = horizontal ? y : y + i;

        if (xi >= 0 && xi < width && yi >= 0 && yi < height) {
            const index = (yi * width + xi) * 4;
            const weight = kernel[i + radius];

            r += data[index] * weight;
            g += data[index + 1] * weight;
            b += data[index + 2] * weight;
            a += data[index + 3] * weight;
        }
    }

    const index = (y * width + x) * 4;
    data[index] = r;
    data[index + 1] = g;
    data[index + 2] = b;
    data[index + 3] = a;
  }
}