# Burn-PDF-Annotation

A demo to burn (flatten) PDF annotations on the web using [Dynamsoft Document Viewer](https://www.dynamsoft.com/document-viewer/docs/introduction/index.html).

[Online demo](https://tony-xlh.github.io/Burn-PDF-Annotation/)

Burning (flattening) annotations means including them as vector graphics into the content of the page, leaving them uneditable.

Dynamsoft Document Viewer can burn all the annotations or selected annotations into a PDF file.

It has four options for saving the annotations:

* `none`: Discard all the annotations
* `image`: Merge all the content into a raster image
* `flatten`: Flatten all the annotations
* `annotation`: Save the annotations in an editable form. Individual annotations marked as flattened will still be flattened

## How Does it Work Internally

PDF files are described using PostScript. We are going to use some examples to show how the flattening works internally.

A PDF file contains a list of dictionaries and here is an example of a page dictionary:

```
4 0 obj
<<
  /Type/Page                 % Specifies that this dictionary defines a page.
  /Annots[ 8 0 R ]           % A list of references to annotation objects on this page.
  /Contents 7 0 R            % Reference to page content stream.
  /MediaBox[ 0 0 147 143.25] % Page dimensions.
  % Other page properties
>>
endobj
7 0 obj
<</Filter/FlateDecode/Length 44>>stream
x??41W0 BCc=#S039椝 ?J缫w媹0Tp蒞? 卵	
endstream
endobj
```

The above page has a reference to the following annotation dictionary:

```
8 0 obj
<<
  /Type/Annot
  /AP<<
  /Contents(annotation)
    /CreationDate(D:20241227135119+08'00')
    /DA(0.9411764705882353 0.07450980392156863 0.0784313725490196 rg /Helvetica 16 Tf)
    /DS(font:  'Helvetica' 16pt; text-align:left; color:#F01314)
    /F 4
    /IT/FreeTextTypeWriter/M(D:20241227135125+08'00')/NM(m56c4eb9uq)/RC(<?xml version="1.0"?><body xmlns="http://www.w3.org/1999/xhtml" xmlns:xfa="http://www.xfa.org/schema/xfa-data/1.0/" xfa:APIVersion="Acrobat:18.11.0" xfa:spec="2.0.2" style="font-size:16pt;text-align:left;color:#f01314;font-weight:normal;font-style:normal;font-family:'Helvetica';font-stretch:normal;"><p dir="ltr"><span>annotation</span></p></body>)
    /Rect[ 22.1854 112.467 98.423 129.217]
    /Subj()
    /Subtype
    /FreeText
    /T()
>>
endobj
```

After flattening, the page dictionary will become the following. It no longer has the annotation node and a node of the converted annotation graphics is appended to its content.

```
4 0 obj
<<
  /Type/Page
  /Contents 13 0 R 
  /MediaBox[ 0 0 147 143.25]
>>
endobj
7 0 obj
<</Filter/FlateDecode/Length 48>>stream
x???41W0 BCc=#S039椝 ?J缫w媹0Tp蒞溻
 靔	?
endstream
endobj
13 0 obj
[ 7 0 R  14 0 R ]
endobj
14 0 obj
<</Filter/FlateDecode/Length 29>>stream
x?T0T0 B櫆珷镦b犩挴 M+?
endstream
endobj
```

## License Application

You can apply for a license [here](https://www.dynamsoft.com/customer/license/trialLicense/?product=dcv&package=cross-platform).
