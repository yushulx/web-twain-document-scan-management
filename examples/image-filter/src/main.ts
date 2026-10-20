import { BlackwhiteFilter } from "./BlackwhiteFilter";
import { ImageFilterHandler } from "./FilterHandler";
import {GrayscaleFilter} from "./GrayscaleFilter";
import { InvertFilter } from "./InvertFilter";
import { SepiaFilter } from "./SepiaFilter";
import { GaussianBlurFilter } from "./GaussianBlurFilter";

(window as any)["GrayscaleFilter"] = GrayscaleFilter;
(window as any)["SepiaFilter"] = SepiaFilter;
(window as any)["InvertFilter"] = InvertFilter;
(window as any)["BlackwhiteFilter"] = BlackwhiteFilter;
(window as any)["ImageFilterHandler"] = ImageFilterHandler;
(window as any)["GaussianBlurFilter"] = GaussianBlurFilter;
