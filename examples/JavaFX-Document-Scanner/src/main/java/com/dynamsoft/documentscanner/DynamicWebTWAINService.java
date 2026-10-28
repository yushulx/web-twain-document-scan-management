package com.dynamsoft.documentscanner;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

import okhttp3.*;

public class DynamicWebTWAINService {
    public String endPoint = "http://127.0.0.1:18622";
    public String license = "";
    private static final MediaType JSON
            = MediaType.get("application/json; charset=utf-8");
    public DynamicWebTWAINService(){

    }
    public DynamicWebTWAINService(String endPoint, String license){
        this.endPoint = endPoint;
        this.license = license;
    }

    public List<Scanner> getScanners() throws IOException {
        OkHttpClient client = new OkHttpClient();
        Request request = new Request.Builder()
                .url(endPoint+"/api/device/scanners")
                .build();
        try (Response response = client.newCall(request).execute()) {
            String body = response.body().string();
            List<Scanner> scanners = new ArrayList<Scanner>();
            ObjectMapper objectMapper = new ObjectMapper();
            List<Map<String,Object>> parsed = objectMapper.readValue(body,new TypeReference<List<Map<String,Object>>>() {});

            for (Map<String,Object> item:parsed) {
                int type = (int) item.get("type");
                String name = (String) item.get("name");
                String device = (String) item.get("device");
                Scanner scanner = new Scanner(name,type,device);
                scanners.add(scanner);
            }
            return scanners;
        }
    }

    public String createScanJob(Scanner scanner) throws Exception {
        return createScanJob(scanner,null,null);
    }

    public String createScanJob(Scanner scanner,DeviceConfiguration config,Capabilities capabilities) throws Exception {
        Map<String,Object> body = new HashMap<String,Object>();
        body.put("device",scanner.device);
        body.put("jobTimeout",999999);
        body.put("scannerFailureTimeout",999999);
        if (config != null) {
            body.put("config",config);
        }
        if (capabilities != null) {
            body.put("caps",capabilities);
        }
        ObjectMapper objectMapper = new ObjectMapper();
        String jsonBody = objectMapper.writeValueAsString(body);
        OkHttpClient client = new OkHttpClient.Builder()
                .connectTimeout(120, TimeUnit.SECONDS)
                .readTimeout(120, TimeUnit.SECONDS)
                .writeTimeout(120, TimeUnit.SECONDS)
                .build();
        RequestBody requestBody = RequestBody.create(jsonBody, JSON);
        Request request = new Request.Builder()
                .url(endPoint+"/api/device/scanners/jobs")
                .addHeader("DWT-PRODUCT-KEY", this.license)
                .addHeader("Content-Type", "application/json")
                .post(requestBody)
                .build();
        try (Response response = client.newCall(request).execute()) {
            if (response.code() == 201) {
                String responseBody = response.body().string();
                ObjectMapper resultMapper = new ObjectMapper();
                Map<String,Object> parsed = resultMapper.readValue(responseBody,new TypeReference<Map<String,Object>>() {});
                return (String) parsed.get("jobuid");
            }else{
                throw new Exception(response.body().string());
            }
        }
    }

    public boolean deleteJob(String jobID) throws Exception {
        OkHttpClient client = new OkHttpClient().newBuilder()
                .build();
        MediaType mediaType = MediaType.parse("text/plain");
        RequestBody body = RequestBody.create(mediaType, "");
        Request request = new Request.Builder()
                .url(endPoint+"/api/device/scanners/jobs/"+jobID)
                .method("DELETE", body)
                .build();
        try (Response response = client.newCall(request).execute()) {
            if (response.code() == 204) {
                return true;
            }else{
                throw new Exception(response.body().string());
            }
        }
    }

    public byte[] nextDocument(String jobID) throws Exception {
        return getImage(jobID);
    }

    private byte[] getImage(String jobID) throws Exception {
        OkHttpClient client = new OkHttpClient.Builder()
                .connectTimeout(120, TimeUnit.SECONDS)
                .readTimeout(120, TimeUnit.SECONDS)
                .writeTimeout(120, TimeUnit.SECONDS)
                .build();
        Request request = new Request.Builder()
                .url(endPoint+"/api/device/scanners/jobs/"+jobID+"/next-page?type=image%2Fjpeg")
                .build();
        try (Response response = client.newCall(request).execute()) {
            if (response.code() == 200) {
                return response.body().bytes();
            }else{
                throw new Exception(response.body().string());
            }
        }
    }
}
