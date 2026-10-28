package com.xulihang.webtwain;

import java.io.File;
import java.io.IOException;
import java.net.DatagramSocket;
import java.net.InetAddress;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import ca.weblite.webview.WebViewCLIClient;
import javafx.application.Platform;
import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.scene.Scene;
import javafx.scene.control.Alert;
import javafx.scene.control.Alert.AlertType;
import javafx.scene.control.Button;
import javafx.scene.control.ButtonBar.ButtonData;
import javafx.scene.control.ButtonType;
import javafx.stage.Stage;

public class PrimaryController {
	private String port = "9091";
	
	@FXML
	private Button primaryButton;
	
    @FXML
    @SuppressWarnings("unchecked")
    private void scanDocuments() throws IOException {
    	File directory = new File("");
    	String dirPath = directory.getAbsolutePath();
    	WebViewCLIClient client = (WebViewCLIClient)new WebViewCLIClient.Builder()
		.url("http://localhost:"+port+"/index.html?outputDir="+dirPath)
		.title("Document Scanner")
		.size(600, 600)
		.build();
        
        // Adding a load listener (fired whenever a page loads)
        client.addLoadListener(evt->{
            System.out.println("Loaded "+evt.getURL());
        });

        // Adding a message listener (fired whenever any js calls window.postMessageExt(msg))
        client.addMessageListener(evt->{
        	String msg = evt.getMessage();
    		System.out.println(msg);
	        if (msg.equals("") || msg.equals("Fin")) {
	        	return;
	        }

            ObjectMapper mapper = new ObjectMapper();
			try {
				List<Object> params = mapper.readValue(msg, List.class);
				Map<String,String> msgMap = (Map<String,String>) params.get(0);
				handleMessages(msgMap);
			} catch (JsonMappingException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			} catch (JsonProcessingException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
         });
    }
    
    private void handleMessages(Map<String,String> msgMap) {
    	String msg = msgMap.get("msg");
    	System.out.println(msg);
    	if (msg.equals("service not installed")) {
			Platform.runLater(new Runnable() {
	            @Override
	            public void run() {
	            	handleServiceUninstalled();
	            }
	        });
    	} else if (msg.equals("download")) {
    		String path = msgMap.get("content");
    		
    		File outputFile = new File(path);
    		if (outputFile.exists()) {
    			
    			System.out.println("Exists "+path);
    			
    			//https://stackoverflow.com/questions/9481865/getting-the-ip-address-of-the-current-machine-using-java
    			try(final DatagramSocket socket = new DatagramSocket()){
				    socket.connect(InetAddress.getByName("8.8.8.8"), 10002);
				    String ip = socket.getLocalAddress().getHostAddress();
				    String link = "http://" + ip + ":"+port+"/"+ outputFile.getName();

					Platform.runLater(new Runnable() {
			            @Override
			            public void run() {
						    try {
						    	Stage newWindow = new Stage();
							    newWindow.setTitle(link);
							    FXMLLoader loader = new FXMLLoader(getClass().getResource("/com/xulihang/webtwain/fxml/qrcode.fxml"));
								newWindow.setScene(new Scene(loader.load()));
								newWindow.setAlwaysOnTop(true);
								newWindow.show();
								QRCodeController controller = (QRCodeController) loader.getController();
							    controller.generateQRCode(link, outputFile);
							} catch (IOException e) {
								// TODO Auto-generated catch block
								e.printStackTrace();
							}
			            }
			        });
				   
				} catch (Exception e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
    			
				
    			
    		}
    		
    	}
    }
    
    private void handleServiceUninstalled() {
    	Alert alert = new Alert(AlertType.CONFIRMATION);
    	alert.setTitle("Info");
    	alert.setHeaderText(null);
    	alert.setContentText("Dynamsoft Service not installed. Please download and install it.");

    	ButtonType downloadBtn = new ButtonType("Download");
    	ButtonType cancelBtn = new ButtonType("Cancel", ButtonData.CANCEL_CLOSE);

    	alert.getButtonTypes().setAll(downloadBtn, cancelBtn);

    	Optional<ButtonType> result = alert.showAndWait();
    	if (result.get() == downloadBtn){
    		App.hostServices.showDocument("https://download.dynamsoft.com/Demo/DWT/DWTResources/dist/DynamsoftServiceSetup.msi");
    	}
    }
    
    @FXML
    public void exitApplication(ActionEvent event) {
    	System.out.println("exiting");
       Platform.exit();
    }
}
