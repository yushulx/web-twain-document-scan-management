import { GenericImageFilter } from "./GenericImageFilter";

export class SepiaFilter extends GenericImageFilter {
  convert(r: number, g: number, b: number, a: number): { r: number; g: number; b: number; a: number; } {
    const red = (r * 0.393)+(g * 0.769)+(b * 0.189);
    const green = (r * 0.349)+(g * 0.686)+(b * 0.168);
    const blue = (r * 0.272)+(g * 0.534)+(b * 0.131);
    return {r:red,g:green,b:blue,a:a};
  }
}