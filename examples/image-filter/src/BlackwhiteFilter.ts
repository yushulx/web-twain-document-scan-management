import { GenericImageFilter } from "./GenericImageFilter";
// @ts-ignore
import otsu from 'otsu';

export class BlackwhiteFilter extends GenericImageFilter {
  threshold:number = 127;
  otsuEnabled:boolean = false;
  adaptive:boolean = false;
  blockSize:number = 31;
  C:number = 10;
  constructor(cvs:HTMLCanvasElement,threshold:number,otsuEnabled:boolean,adaptive:boolean,blockSize:number,C:number){
    super(cvs);
    this.threshold = threshold;
    this.otsuEnabled = otsuEnabled;
    this.adaptive = adaptive;
    this.blockSize = blockSize;
    this.C = C;
  }

  process(img:HTMLImageElement|HTMLCanvasElement|HTMLVideoElement):number{
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
    let threshold = 0;
    if (context) {
      context.drawImage(img, 0, 0);
      let imageData = context.getImageData(0, 0, this.cvs.width, this.cvs.height);
      if (this.adaptive) {
        imageData = this.adaptiveThresholdWithIntegralImage(imageData);
      }else{
        threshold = this.globalThresholding(imageData)
      }
      context.putImageData(imageData, 0, 0);
    }
    return threshold;
  }

  adaptiveThresholdWithIntegralImage(imageData:ImageData) {
    const width = imageData.width;
    const height = imageData.height;
    const blockSize = this.blockSize;
    const C = this.C;
    const data = imageData.data;
    const output = new ImageData(width, height);
    const outputData = output.data;

    const integral = this.computeIntegralImage(data, width, height);

    const halfBlock = Math.floor(blockSize / 2);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const x1 = Math.max(x - halfBlock, 0);
        const y1 = Math.max(y - halfBlock, 0);
        const x2 = Math.min(x + halfBlock, width - 1);
        const y2 = Math.min(y + halfBlock, height - 1);

        const area = (x2 - x1 + 1) * (y2 - y1 + 1);
        const sum = this.getAreaSum(integral, width, x1, y1, x2, y2);
        const threshold = (sum / area) - C;

        const idx = (y * width + x) * 4;
        const pixelValue = data[idx];
        outputData[idx] = outputData[idx + 1] = outputData[idx + 2] = pixelValue > threshold ? 255 : 0;
        outputData[idx + 3] = 255; // Alpha channel
      }
    }
    return output;
  }

  computeIntegralImage(data:Uint8ClampedArray, width:number, height:number) {
    const integral = new Uint32Array(width * height);

    for (let y = 0; y < height; y++) {
      let sum = 0;
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        sum += data[idx];
        integral[y * width + x] = (y > 0 ? integral[(y - 1) * width + x] : 0) + sum;
      }
    }

    return integral;
  }

  getAreaSum(integral:Uint32Array, width:number, x1:number, y1:number, x2:number, y2:number) {
    const a = x1 > 0 && y1 > 0 ? integral[(y1 - 1) * width + (x1 - 1)] : 0;
    const b = y1 > 0 ? integral[(y1 - 1) * width + x2] : 0;
    const c = x1 > 0 ? integral[y2 * width + (x1 - 1)] : 0;
    const d = integral[y2 * width + x2];
    return d - b - c + a;
  }

  globalThresholding(imageData:ImageData){
    const pixels = imageData.data; //[r,g,b,a,...]
    const grayscaleValues = [];
    for (var i = 0; i < pixels.length; i += 4) {
      const red = pixels[i];
      const green = pixels[i + 1];
      const blue = pixels[i + 2];
      const grayscale = this.grayscale(red, green, blue);
      grayscaleValues.push(grayscale);
    }
    let threshold;
    if (this.otsuEnabled) {
      threshold = otsu(grayscaleValues);
    }else{
      threshold = this.threshold;
    }
    let grayscaleIndex = 0;
    for (var i = 0; i < pixels.length; i += 4) {
      const gray = grayscaleValues[grayscaleIndex];
      grayscaleIndex = grayscaleIndex + 1;
      let value = 255;
      if (gray < threshold) {
        value = 0;
      }
      pixels[i] = value;
      pixels[i + 1] = value;
      pixels[i + 2] = value;
    }
    return threshold;
  }

  grayscale(r: number, g: number, b: number): number {
    return (r * 6966 + g * 23436 + b * 2366) >> 15;
  }

  setAdaptive(adaptive:boolean,blockSize:number,C:number) {
    this.adaptive = adaptive;
    this.blockSize = blockSize;
    this.C = C;
  }

  setThreshold(threshold:number){
    this.adaptive = false;
    this.threshold = threshold;
  }

  setOTSUEnabled(enabled:boolean){
    this.adaptive = false;
    this.otsuEnabled = enabled;
  }
}