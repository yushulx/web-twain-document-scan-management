# clean-and-repair-scanned-documents

A web demo for cleaning and repairing scanned documents

* [main](https://tony-xlh.github.io/clean-and-repair-scanned-documents/). The main demo. [Dynamsoft Document Viewer](https://www.dynamsoft.com/document-viewer/docs/introduction/index.html) is used. You can perform image filtering, drawing and inpainting.
* [inpaint](https://tony-xlh.github.io/clean-and-repair-scanned-documents/inpainting.html). The inpainting demo which lets you select a mask image and a source image for inpainting.

## How it Cleans the Documents

1. Convert the image to black and white to clean the background and improve the contrast. We can see that the noise and shadow can be removed.

   Scanned image:

   ![scanned.jpg](samples/scanned.jpg)

   Black and white image:

   ![scanned-bw.jpg](samples/scanned-bw.jpg)

2. Use free drawing or image inpainting to remove unwanted objects.

   Original image:

   ![src.png](samples/src.png)

   Mask:

   ![mask.png](samples/mask.png)

   Inpainted:

   ![inpainted.png](samples/inpainted.png)

## Demo Video



https://github.com/user-attachments/assets/43e99ff5-2fbf-42af-86a5-bf430b7e1e8b



## Credits

[inpaint.js](https://github.com/antimatter15/inpaint.js/)




