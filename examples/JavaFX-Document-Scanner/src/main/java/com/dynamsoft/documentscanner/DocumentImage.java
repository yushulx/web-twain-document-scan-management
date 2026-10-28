package com.dynamsoft.documentscanner;

import javafx.scene.image.ImageView;

public class DocumentImage {
    public ImageView imageView;
    public byte[] image;
    public DocumentImage(ImageView imageView,byte[] image) {
        this.imageView = imageView;
        this.image = image;
    }
}
