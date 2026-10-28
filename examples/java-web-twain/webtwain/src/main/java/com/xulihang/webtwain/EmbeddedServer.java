package com.xulihang.webtwain;

import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.server.handler.ResourceHandler;

public class EmbeddedServer {
    private Server server;
	public EmbeddedServer() {
		server = new Server(9091);
        ResourceHandler resourceHandler = new ResourceHandler();
        resourceHandler.setDirAllowed(true);
        resourceHandler.setResourceBase(".");
        server.setHandler(resourceHandler);
        
	}
	
	public void start() throws Exception {
        server.start();
	}
	
	public void stop() throws Exception {
		server.stop();
	}
	
	
	
}
