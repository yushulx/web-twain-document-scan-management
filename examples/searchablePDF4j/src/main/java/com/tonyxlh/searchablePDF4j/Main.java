package com.tonyxlh.searchablePDF4j;

import org.apache.pdfbox.pdmodel.PDDocument;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Base64;


public class Main {
    public static void main(String[] args) throws IOException {
        File image = new File("F://WebTWAINImage.jpg");
        byte[] byteArray = new byte[(int) image.length()];
        try (FileInputStream inputStream = new FileInputStream(image)) {
            inputStream.read(byteArray);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        //ArrayList<byte[]> images = new ArrayList<>();
        //images.add(byteArray);
        //SearchablePDFCreator.create(images,"F://output.pdf");
        //String base64 = Base64.getEncoder().encodeToString(byteArray);
        OCRSpace.key = "yourkey";
        //OCRResult result = OCRSpace.detect(base64);
        //PDDocument document = new PDDocument();
        //SearchablePDFCreator.addPage(byteArray,result,document,0);
        //document.save(new File("F://output.pdf"));
        //document.close();
        SearchablePDFCreator.convert("F://WebTWAINImage.pdf","F://WebTWAINImage-searchable.pdf");
    }
}