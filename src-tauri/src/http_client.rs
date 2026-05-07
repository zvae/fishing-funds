use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RequestConfig {
    pub response_type: Option<String>,
    pub headers: Option<HashMap<String, String>>,
    pub search_params: Option<HashMap<String, String>>,
    pub method: Option<String>,
    pub body: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HttpResponse {
    pub body: serde_json::Value,
    pub headers: HashMap<String, String>,
}

pub struct HttpClient {
    client: Client,
}

impl HttpClient {
    pub fn new() -> Self {
        Self {
            client: Client::new(),
        }
    }
    
    pub async fn request(
        &self,
        url: String,
        config: Option<RequestConfig>,
    ) -> Result<HttpResponse, Box<dyn std::error::Error>> {
        let config = config.unwrap_or(RequestConfig {
            response_type: Some("text".to_string()),
            headers: None,
            search_params: None,
            method: None,
            body: None,
        });
        
        let method = config.method.unwrap_or_else(|| "GET".to_string());
        let mut request = match method.as_str() {
            "POST" => self.client.post(&url),
            "PUT" => self.client.put(&url),
            "DELETE" => self.client.delete(&url),
            _ => self.client.get(&url),
        };
        
        if let Some(headers) = config.headers {
            for (key, value) in headers {
                request = request.header(&key, &value);
            }
        }
        
        if let Some(params) = config.search_params {
            request = request.query(&params);
        }
        
        if let Some(body) = config.body {
            request = request.body(body);
        }
        
        let response = request.send().await?;
        
        let mut headers = HashMap::new();
        for (key, value) in response.headers() {
            if let Ok(v) = value.to_str() {
                headers.insert(key.to_string(), v.to_string());
            }
        }
        
        let response_type = config.response_type.unwrap_or_else(|| "text".to_string());
        let body = match response_type.as_str() {
            "json" => {
                let text = response.text().await?;
                serde_json::from_str(&text).unwrap_or(serde_json::Value::String(text))
            }
            _ => {
                let text = response.text().await?;
                serde_json::Value::String(text)
            }
        };
        
        Ok(HttpResponse { body, headers })
    }
}