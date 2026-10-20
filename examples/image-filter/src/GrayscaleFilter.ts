import { GenericImageFilter } from "./GenericImageFilter";

export class GrayscaleFilter extends GenericImageFilter {
  convert(r: number, g: number, b: number, a: number): { r: number; g: number; b: number; a: number; } {
    const gray = (r * 6966 + g * 23436 + b * 2366) >> 15;
    return {r:gray,g:gray,b:gray,a:a};
  }
}