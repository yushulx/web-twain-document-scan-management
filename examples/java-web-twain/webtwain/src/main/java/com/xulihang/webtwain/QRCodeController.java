package com.xulihang.webtwain;

import java.awt.image.BufferedImage;
import java.io.File;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.MultiFormatWriter;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;

import javafx.embed.swing.SwingFXUtils;
import javafx.event.Event;
import javafx.fxml.FXML;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.stage.Stage;

public class QRCodeController {

	@FXML private ImageView qrcodeImageView;
	public File file;

	public void generateQRCode(String link, File outputFile) {
		file = outputFile;
		try {
			BitMatrix matrix = new MultiFormatWriter().encode(
			        link,
			        BarcodeFormat.QR_CODE, 400, 400);
			BufferedImage bi = MatrixToImageWriter.toBufferedImage(matrix);
			Image img = SwingFXUtils.toFXImage(bi, null);
			qrcodeImageView.setImage(img);
			qrcodeImageView.setFitWidth(400);
			qrcodeImageView.setFitHeight(400);
		} catch (WriterException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	
	@FXML
	private void deleteAndCloseButton_MouseClicked(Event e) {
		file.delete();
		Stage stage = (Stage) qrcodeImageView.getScene().getWindow();
	    stage.close();
	}
}
