package org.example;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.HashMap;
import java.util.Map;

import org.json.JSONObject;

public class RequestWord {

    public Map<String, Object> getWord() {
        String url = "https://api.dicionario-aberto.net/random";
        String word = "";

        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Accept", "application/json")
                .GET()
                .build();

        try {
            //Enquanto a palavra não tiver 5 letras.
            while (word.length() != 5) {
                HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

                if (response.statusCode() == 200) {
                    JSONObject jsonResponse = new JSONObject(response.body());
                    word = jsonResponse.getString("word");
                } else {
                    return createResponse(500, "Erro " + response.statusCode());
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            return createResponse(500, "Erro: " + e.getMessage());
        }

        return createResponse(200, word);
    }

    private Map<String, Object> createResponse(int statusCode, String body) {
        Map<String, Object> response = new HashMap<>();
        response.put("statusCode", statusCode);
        response.put("body", body); // Apenas a palavra, sem JSON extra

        // Cabeçalhos para permitir CORS
        Map<String, String> headers = new HashMap<>();
        headers.put("Content-Type", "text/plain"); // Define o retorno como texto puro
        headers.put("Access-Control-Allow-Origin", "*");
        headers.put("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        headers.put("Access-Control-Allow-Headers", "Content-Type");

        response.put("headers", headers);
        return response;
    }
}
