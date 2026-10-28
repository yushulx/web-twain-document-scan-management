package com.dynamsoft.documentscanner;

import com.tonyxlh.searchablePDF4j.OCRResult;
import com.tonyxlh.searchablePDF4j.OCRSpace;
import com.tonyxlh.searchablePDF4j.SearchablePDFCreator;
import javafx.application.Platform;
import javafx.beans.value.ChangeListener;
import javafx.beans.value.ObservableValue;
import javafx.collections.FXCollections;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.stage.FileChooser;
import javafx.stage.Stage;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.util.*;

public class HelloController {
    private  Stage progressStage;
    @FXML
    private Button scanButton;
    @FXML
    private ComboBox<String> scannersComboBox;
    @FXML
    private ListView<DocumentImage> documentListView;
    @FXML
    private CheckBox showUICheckBox;
    @FXML
    private CheckBox duplexCheckBox;
    @FXML
    private CheckBox ADFCheckBox;
    @FXML
    private CheckBox searchablePDFCheckBox;
    @FXML
    private TextField licenseKeyTextField;
    @FXML
    private TextField OCRSpaceKeyTextField;
    @FXML
    private ComboBox resolutionComboBox;
    @FXML
    private ComboBox pixelTypeComboBox;
    private List<Scanner> scanners = new ArrayList<Scanner>();
    private DynamicWebTWAINService service = new DynamicWebTWAINService("http://127.0.0.1:18622","");
    private String jobID = "";
    public void initialize(){
        try {
            this.createProgressStage();
            this.loadResolutions();
            this.loadPixelTypes();
            this.loadScanners();
            ChangeListener<Number> changeListener = new ChangeListener<Number>() {
                @Override
                public void changed(ObservableValue<? extends Number> observable, Number oldValue, Number newValue) {
                    for (DocumentImage item:documentListView.getItems()) {
                        item.imageView.setFitWidth(documentListView.widthProperty().subtract(30).doubleValue());
                    }
                }
            };
            documentListView.widthProperty().addListener(changeListener);
            ContextMenu contextMenu = new ContextMenu();
            MenuItem deleteMenuItem = new MenuItem("Delete selected");
            deleteMenuItem.setOnAction(e -> {
                var indices = documentListView.getSelectionModel().getSelectedIndices();
                for (int i = indices.size() - 1; i >= 0; i--) {
                    int index = indices.get(i);
                    documentListView.getItems().remove(index);
                }
            });
            contextMenu.getItems().add(deleteMenuItem);
            // setContextMenu to label
            documentListView.setContextMenu(contextMenu);
            documentListView.getSelectionModel().setSelectionMode(SelectionMode.MULTIPLE);
            documentListView.setCellFactory(param -> new ListCell<DocumentImage>() {
                {
                    prefWidthProperty().bind(documentListView.widthProperty().subtract(30));
                    setMaxWidth(Control.USE_PREF_SIZE);
                }
                @Override
                protected void updateItem(DocumentImage item, boolean empty) {
                    super.updateItem(item, empty);
                    Platform.runLater(() -> {
                        if (empty) {
                            setGraphic(null);
                        } else {
                            item.imageView.setFitWidth(documentListView.widthProperty().subtract(30).doubleValue());
                            setGraphic(item.imageView);
                        }
                    });
                }
            });
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private void loadResolutions(){
        List<Integer> resolutions = new ArrayList<Integer>();
        resolutions.add(100);
        resolutions.add(200);
        resolutions.add(300);
        resolutions.add(600);
        resolutionComboBox.setItems(FXCollections.observableList(resolutions));
        resolutionComboBox.getSelectionModel().select(1);
    }

    private void loadPixelTypes(){
        List<String> pixelTypes = new ArrayList<String>();
        pixelTypes.add("Black & White");
        pixelTypes.add("Gray");
        pixelTypes.add("Color");
        pixelTypeComboBox.setItems(FXCollections.observableList(pixelTypes));
        pixelTypeComboBox.getSelectionModel().select(0);
    }

    private void loadScanners() throws IOException, InterruptedException {
        scanners = service.getScanners();
        List<String> names = new ArrayList<String>();
        for (Scanner scanner:scanners) {
            try {
                names.add(scanner.name + " (" +DeviceType.getDisplayName(scanner.type)+ ")");
            } catch (Exception e) {
                System.out.println(e.getMessage());
            }
        }
        scannersComboBox.setItems(FXCollections.observableList(names));
        if (names.size()>0) {
            scannersComboBox.getSelectionModel().select(0);
        }
    }

    @FXML
    protected void onScanButtonClicked() {
        if (scanButton.getText().equals("Scan")) {
            scanButton.setText("Cancel");
            startScanning();
        }else{
            stopScanning();
            scanButton.setText("Scan");
        }
    }

    private void stopScanning(){
        try {
            System.out.println("delete job: "+jobID);
            service.deleteJob(jobID);
            jobID = "";
            progressStage.close();
        } catch (Exception e) {
            showMessage(e.getMessage());
        }
    }

    private void startScanning(){
        int selectedIndex = scannersComboBox.getSelectionModel().getSelectedIndex();
        if (selectedIndex != -1) {
            service.license = licenseKeyTextField.getText();
            progressStage.show();
            Thread t = new Thread(() -> {
                Scanner scanner  = scanners.get(selectedIndex);
                try {
                    DeviceConfiguration config = new DeviceConfiguration();
                    config.IfShowUI = showUICheckBox.isSelected();
                    config.IfDuplexEnabled = duplexCheckBox.isSelected();
                    config.IfFeederEnabled = ADFCheckBox.isSelected();
                    config.Resolution = (int) resolutionComboBox.getSelectionModel().getSelectedItem();
                    Capabilities caps = new Capabilities();
                    caps.exception = "ignore";
                    caps.capabilities = new ArrayList<CapabilitySetup>();
                    CapabilitySetup pixelTypeSetup = new CapabilitySetup();
                    pixelTypeSetup.capability = 257;
                    pixelTypeSetup.curValue = pixelTypeComboBox.getSelectionModel().getSelectedIndex();
                    caps.capabilities.add(pixelTypeSetup);
                    jobID = service.createScanJob(scanner,config,caps);
                    System.out.println("ID: "+jobID);
                    byte[] image = service.nextDocument(jobID);
                    while (image != null){
                        if (jobID.equals("")) { //canceled
                            break;
                        }
                        loadImage(image);
                        image = service.nextDocument(jobID);
                    }
                } catch (Exception e) {
                    System.out.println(e.getMessage());
                    Platform.runLater(() -> {
                        showMessage(e.getMessage());
                    });
                }
                Platform.runLater(() -> {
                    scanButton.setText("Scan");
                    HelloApplication.primaryStage.requestFocus();
                    progressStage.close();
                });
            });
            t.start();
        }
    }

    private void showMessage(String msg){
        if (msg.equals("") == false) {
            Alert alert = new Alert(Alert.AlertType.ERROR);
            alert.setHeaderText(null);
            alert.setContentText(msg);
            alert.show();
        }
    }

    private void loadImage(byte[] image){
        Platform.runLater(() -> {
            System.out.println("image: "+image.length);
            System.out.println(image.length);
            Image img = new Image(new ByteArrayInputStream(image));
            ImageView iv = new ImageView();
            iv.setPreserveRatio(true);
            iv.setImage(img);
            DocumentImage di = new DocumentImage(iv,image);
            documentListView.getItems().add(di);
        });
    }

    @FXML
    protected void onSaveButtonClicked() throws IOException {
        OCRSpace.key = OCRSpaceKeyTextField.getText();
        FileChooser fileChooser = new FileChooser();
        fileChooser.setTitle("Open Resource File");
        File fileToSave = fileChooser.showSaveDialog(null);
        if (fileToSave != null) {
            progressStage.show();
            Thread t = new Thread(() -> {
                try {
                    PDDocument document = new PDDocument();
                    int index = 0;
                    for (DocumentImage di: documentListView.getItems()) {
                        index = index + 1;
                        ImageView imageView = di.imageView;
                        PDRectangle rect = new PDRectangle((float) imageView.getImage().getWidth(),(float) imageView.getImage().getHeight());
                        System.out.println(rect);
                        PDPage page = new PDPage(rect);
                        document.addPage(page);
                        PDPageContentStream contentStream = new PDPageContentStream(document, page);
                        PDImageXObject image
                                = PDImageXObject.createFromByteArray(document,di.image,String.valueOf(index));
                        contentStream.drawImage(image, 0, 0);
                        if (searchablePDFCheckBox.isSelected()) {
                            String base64 = Base64.getEncoder().encodeToString(di.image);
                            OCRResult result = OCRSpace.detect(base64);
                            SearchablePDFCreator.addTextOverlay(contentStream,result,image.getHeight());
                        }
                        contentStream.close();
                    }
                    document.save(fileToSave.getAbsolutePath());
                    document.close();
                } catch (IOException e) {
                    throw new RuntimeException(e);
                }
                Platform.runLater(() -> {
                    progressStage.close();
                });
            });
            t.start();

        }
    }

    public void createProgressStage() throws IOException {
        FXMLLoader fxmlLoader = new FXMLLoader(HelloController.class.getResource("progress.fxml"));
        Scene scene = new Scene(fxmlLoader.load());
        Stage progressStage = new Stage();
        progressStage.setTitle("Document Scanner");
        progressStage.setScene(scene);
        this.progressStage = progressStage;
    }
}
