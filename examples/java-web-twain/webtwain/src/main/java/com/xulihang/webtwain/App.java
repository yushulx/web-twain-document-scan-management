package com.xulihang.webtwain;

import javafx.application.Application;
import javafx.application.HostServices;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.stage.Stage;

import java.io.IOException;

/**
 * JavaFX App
 */
public class App extends Application {

    private static Scene scene;
    public static HostServices hostServices;
    private static EmbeddedServer server;
    @Override
    public void start(Stage stage) throws IOException {
    	hostServices=getHostServices();
    	scene = new Scene(loadFXML("primary"));
        stage.setScene(scene);
        stage.setTitle("Java Web TWAIN");
        stage.setOnCloseRequest(event -> {
			System.out.println("Stopping server and exit.");
			try {
				server.stop();
				System.exit(0);
			} catch (Exception e) {
				e.printStackTrace();
			}
		});
        stage.show();
        server = new EmbeddedServer();
    	try {
			server.start();
		} catch (Exception e) {
			e.printStackTrace();
		}
    }

    static void setRoot(String fxml) throws IOException {
        scene.setRoot(loadFXML(fxml));
    }

    private static Parent loadFXML(String fxml) throws IOException {
        FXMLLoader fxmlLoader = new FXMLLoader(App.class.getResource("/com/xulihang/webtwain/fxml/" + fxml + ".fxml"));
        return fxmlLoader.load();
    }

    public static void main(String[] args) {
        launch();
    }

}