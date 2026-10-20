# PDF2Image

A web app to convert PDF to images.

[Online demo](https://tony-xlh.github.io/PDF2Image/)

It uses [Dynamic Web TWAIN](https://www.dynamsoft.com/web-twain/overview/) to convert PDF to images which provides several options:

* Convert Mode:
   * Image only. Directly extract the images in PDF files.
   * Render all. Render pages into images. The output image's resolution and bitdepth might be different from its original values.
   * Auto. Automatically detect which mode to use based on whether the PDF page contains only one image.
* Resolution: specify the DPI for the rendering of pages. Only valid using the "Render all" mode.
* Render with annotations: render PDF annotations.
* Password: for encrypted PDFs.


