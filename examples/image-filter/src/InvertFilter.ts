import { GenericImageFilter } from "./GenericImageFilter";

export class InvertFilter extends GenericImageFilter {
  convert(r: number, g: number, b: number, a: number): { r: number; g: number; b: number; a: number; } {
    r = 255 - r;
    g = 255 - g;
    b = 255 - b;
    return {r:r,g:g,b:b,a:a};
  }
}