package com.tonyxlh.searchablePDF4j;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import okhttp3.*;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

public class OCRSpace {
    public static String key = "";
    public static String lang = "eng";
    /**
     * Get OCR result from a base64-encoded image in JPEG format
     *
     * @param base64 - base64-encoded image
     *
     */
    public static OCRResult detect(String base64) throws IOException {
        OCRResult result = new OCRResult();
        File jsonFile = new File("ocr.json");
        if (jsonFile.exists()) {
            String content = new String(Files.readAllBytes(Paths.get("F://ocr.json")));
            parse(content,result);
        }else{
            OkHttpClient client = new OkHttpClient.Builder()
                    .connectTimeout(120, TimeUnit.SECONDS)
                    .build();
            RequestBody requestBody=new FormBody.Builder()
                    .add("apikey",key)
                    .add("language",lang)
                    .add("base64Image","data:image/jpeg;base64,"+base64.trim())
                    .add("isOverlayRequired","true")
                    .build();

            Request httpRequest = new Request.Builder()
                    .url("https://api.ocr.space/parse/image")
                    .post(requestBody)
                    .build();
            try (Response response = client.newCall(httpRequest).execute()) {
                try {
                    String json = response.body().string();
                    //String path = "F:\\ocr.json";
                    //Files.write( Paths.get(path), json.getBytes());
                    //System.out.println(json);
                    parse(json,result);
                } catch (IOException e) {
                    throw new RuntimeException(e);
                }
            }
        }

        return result;
    }

    private static void parse(String json,OCRResult ocrResult) throws JsonProcessingException {
        ObjectMapper objectMapper = new ObjectMapper();
        Map<String,Object> body = objectMapper.readValue(json,new TypeReference<Map<String,Object>>() {});
        List<Map<String,Object>> parsedResults = (List<Map<String, Object>>) body.get("ParsedResults");
        for (Map<String,Object> parsedResult:parsedResults) {
            Map<String,Object> textOverlay = (Map<String, Object>) parsedResult.get("TextOverlay");
            List<Map<String,Object>> lines = (List<Map<String, Object>>) textOverlay.get("Lines");
            for (Map<String,Object> line:lines) {
                TextLine textLine = parseAsTextLine(line);
                ocrResult.lines.add(textLine);
            }
        }
    }

    private static TextLine parseAsTextLine(Map<String,Object> line){
        String lineText = (String) line.get("LineText");
        List<Map<String,Object>> words = (List<Map<String, Object>>) line.get("Words");
        int minX = (int)((double) words.get(0).get("Left"));
        int minY = (int)((double) words.get(0).get("Top"));
        int maxX = 0;
        int maxY = 0;
        for (Map<String,Object> word:words) {
            int x = (int)((double) word.get("Left"));
            int y = (int)((double) word.get("Top"));
            int width = (int)((double) word.get("Width"));
            int height = (int)((double) word.get("Height"));
            minX = Math.min(minX,x);
            minY = Math.min(minY,y);
            maxX = Math.max(maxX,x+width);
            maxY = Math.max(maxY,y+height);
        }
        return new TextLine(minX,minY,maxX - minX,maxY-minY,lineText);
    }


}
