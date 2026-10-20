import { InvertFilter } from ".";
import { BlackwhiteFilter } from "./BlackwhiteFilter";
import { GrayscaleFilter } from "./GrayscaleFilter";
import { SepiaFilter } from "./SepiaFilter";
import { GaussianBlurFilter } from "./GaussianBlurFilter";

let DDV;
//allows setting the DDV namespace. It is needed if Dynamsoft Document Viewer (DDV) is installed with NPM.
export function setDDV(DocumentViewer:any) {
  DDV = DocumentViewer;
}
const canvas = document.createElement('canvas');
if ((window as any)["Dynamsoft"]) {
  const Dynamsoft = (window as any)["Dynamsoft"];
  DDV = Dynamsoft.DDV;
}

const canvasToBlob = async () => {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      }else{
        reject();
      }
    },"image/jpeg",100);
  })
}

const imageFromBlob = async (blob:Blob):Promise<HTMLImageElement> => {
  return new Promise<HTMLImageElement>((resolve, _reject) => {
    let img = document.createElement("img");
    img.onload = function () {
      resolve(img);
    }
    let url = URL.createObjectURL(blob);
    img.src = url;
  })
}

if (!DDV) {
  class ImageFilter {}
  DDV = {ImageFilter:ImageFilter};
}

export class ImageFilterHandler extends DDV.ImageFilter  {
  async applyFilter(image:any, type:string) {
    if (type === "original") {
      return new Promise((r, _j) => {
        r(image.data)
      });
    }else{
      let img = await imageFromBlob(image.data);
      if (type === "BW") {
        let blackwhiteFilter = new BlackwhiteFilter(canvas,127,true,false,31,10);
        blackwhiteFilter.process(img);
      }else if (type === "BW (adaptive)") {
        let blackwhiteFilter = new BlackwhiteFilter(canvas,127,true,true,31,10);
        blackwhiteFilter.process(img);
      }else if (type === "sepia") {
        let sepiaFilter = new SepiaFilter(canvas);
        sepiaFilter.process(img);
      }else if (type === "grayscale") {
        let grayscaleFilter = new GrayscaleFilter(canvas);
        grayscaleFilter.process(img);
      }else if (type === "invert") {
        let invertFilter = new InvertFilter(canvas);
        invertFilter.process(img);
      }else if (type === "blur") {
        let gaussianBlurFilter = new GaussianBlurFilter(canvas,3);
        gaussianBlurFilter.process(img);
      }
      let blob = await canvasToBlob();
      return new Promise((r, _j) => {
        r(blob)
      });
    }
  };
  get defaultFilterType() {
    return "original"
  };
  querySupported() {
    return [
      {
        type: "original",
        label: "Original"
      },
      {
        type: "grayscale",
        label: "Gray",
      },
      {
        type: "BW",
        label: "B&W"
      },
      {
        type: "BW (adaptive)",
        label: "B&W (adaptive)"
      },
      {
        type: "invert",
        label: "Invert"
      },
      {
        type: "sepia",
        label: "Retro",
      },
      {
        type: "blur",
        label: "Blur",
      }
    ]
  };
  destroy() {
    super.destroy()
  };
}