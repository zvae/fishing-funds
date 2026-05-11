use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager};
use tauri_plugin_store::StoreExt;
use base64::Engine;
use open;

use crate::hotkey::HotkeyManager;
use crate::http_client::{HttpClient, RequestConfig};
use crate::store::StoreType;

#[derive(Debug, Serialize, Deserialize)]
pub struct StorageConfig {
    pub r#type: StoreType,
    #[serde(default)]
    pub key: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub init: Option<serde_json::Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub value: Option<serde_json::Value>,
}

#[tauri::command]
pub async fn get_storage_config(
    app: AppHandle,
    config: StorageConfig,
) -> Result<Option<serde_json::Value>, String> {
    let store = app.store(config.r#type.to_string()).map_err(|e| e.to_string())?;
    let key = config.key.ok_or("Key is required")?;
    let value = store.get(key).or_else(|| config.init.clone());
    Ok(value)
}

#[tauri::command]
pub async fn set_storage_config(app: AppHandle, config: StorageConfig) -> Result<(), String> {
    let store = app.store(config.r#type.to_string()).map_err(|e| e.to_string())?;
    let key = config.key.ok_or("Key is required")?;
    
    if let Some(value) = config.value {
        store.set(key, value);
        store.save().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub async fn delete_storage_config(app: AppHandle, config: StorageConfig) -> Result<(), String> {
    let store = app.store(config.r#type.to_string()).map_err(|e| e.to_string())?;
    let key = config.key.ok_or("Key is required")?;
    store.delete(key);
    store.save().map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn cover_storage_config(app: AppHandle, config: StorageConfig) -> Result<(), String> {
    let store = app.store(config.r#type.to_string()).map_err(|e| e.to_string())?;
    
    if let Some(value) = config.value {
        if let serde_json::Value::Object(map) = value {
            for (k, v) in map {
                store.set(k, v);
            }
            store.save().map_err(|e| e.to_string())?;
        }
    }
    Ok(())
}

#[tauri::command]
pub async fn all_storage_config(
    app: AppHandle,
    config: StorageConfig,
) -> Result<serde_json::Value, String> {
    let store = app.store(config.r#type.to_string()).map_err(|e| e.to_string())?;
    
    let mut result = serde_json::Map::new();
    for (key, value) in store.entries() {
        result.insert(key.to_string(), value.clone());
    }
    Ok(serde_json::Value::Object(result))
}

#[tauri::command]
pub async fn show_message_box(
    _app: AppHandle,
    config: serde_json::Value,
) -> Result<bool, String> {
    use tauri_plugin_dialog::DialogExt;
    let message = config.get("message").and_then(|v| v.as_str()).unwrap_or("");
    Ok(_app.dialog().message(message).blocking_show())
}

#[tauri::command]
pub async fn show_save_dialog(
    _app: AppHandle,
    _config: serde_json::Value,
) -> Result<Option<std::path::PathBuf>, String> {
    use tauri_plugin_dialog::DialogExt;
    Ok(_app.dialog().file().blocking_save_file().and_then(|f| f.as_path().map(|p| p.to_path_buf())))
}

#[tauri::command]
pub async fn show_open_dialog(
    _app: AppHandle,
    _config: serde_json::Value,
) -> Result<Option<std::path::PathBuf>, String> {
    use tauri_plugin_dialog::DialogExt;
    Ok(_app.dialog().file().blocking_pick_file().and_then(|f| f.as_path().map(|p| p.to_path_buf())))
}

#[tauri::command]
pub async fn set_login_item_settings(
    _app: AppHandle,
    _enabled: bool,
) -> Result<(), String> {
    Ok(())
}

#[tauri::command]
pub async fn app_quit(app: AppHandle) {
    app.exit(0);
}

#[tauri::command]
pub async fn app_relaunch(app: AppHandle) {
    app.restart();
}

#[tauri::command]
pub async fn get_version(app: AppHandle) -> Result<String, String> {
    Ok(app.config().version.clone().unwrap_or_default())
}

#[tauri::command]
pub async fn get_platform() -> Result<String, String> {
    Ok(std::env::consts::OS.to_string())
}

#[tauri::command]
pub async fn get_should_use_dark_colors() -> Result<bool, String> {
    #[cfg(target_os = "macos")]
    {
        use cocoa::appkit::{NSAppearance, NSAppearanceNameAqua};
        use cocoa::base::nil;
        unsafe {
            let appearance = NSAppearance::currentAppearance(nil);
            let dark_mode = NSAppearance::appearanceNamed(appearance, NSAppearanceNameAqua);
            Ok(dark_mode != nil)
        }
    }
    #[cfg(not(target_os = "macos"))]
    {
        Ok(false)
    }
}

#[tauri::command]
pub async fn set_tray_content(app: AppHandle, content: String) -> Result<(), String> {
    if let Some(tray) = app.tray_by_id("main") {
        tray.set_title(Some(&content)).map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub async fn set_menubar_visible(app: AppHandle, visible: bool) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("main") {
        if visible {
            window.show().map_err(|e| e.to_string())?;
        } else {
            window.hide().map_err(|e| e.to_string())?;
        }
    }
    Ok(())
}

#[tauri::command]
pub async fn check_update(app: AppHandle) -> Result<(), String> {
    crate::updater::check_update(&app).await;
    Ok(())
}

#[tauri::command]
pub async fn shell_open_external(_app: AppHandle, url: String) -> Result<(), String> {
    open::that(&url).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn request(
    url: String,
    config: Option<RequestConfig>,
) -> Result<crate::http_client::HttpResponse, String> {
    let client = HttpClient::new();
    client.request(url, config).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn io_save_image(path: String, content: String) -> Result<(), String> {
    let base64_data = content
        .split(',')
        .nth(1)
        .ok_or("Invalid data URL")?;
    let bytes = base64::engine::general_purpose::STANDARD.decode(base64_data.as_bytes()).map_err(|e| e.to_string())?;
    tokio::fs::write(&path, bytes)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn io_save_json_to_csv(path: String, content: Vec<serde_json::Value>) -> Result<(), String> {
    let mut wtr = csv::Writer::from_writer(vec![]);
    if let Some(first) = content.first() {
        if let serde_json::Value::Object(map) = first {
            let headers: Vec<String> = map.keys().cloned().collect();
            wtr.write_record(&headers).map_err(|e| e.to_string())?;
            for item in content {
                if let serde_json::Value::Object(m) = item {
                    let record: Vec<String> = headers
                        .iter()
                        .map(|h| m.get(h).and_then(|v| v.as_str()).unwrap_or("").to_string())
                        .collect();
                    wtr.write_record(&record).map_err(|e| e.to_string())?;
                }
            }
        }
    }
    let csv_data = wtr.into_inner().map_err(|e| e.to_string())?;
    tokio::fs::write(&path, csv_data)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn io_save_string(path: String, content: String) -> Result<(), String> {
    tokio::fs::write(&path, content)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn io_read_string_file(path: String) -> Result<String, String> {
    tokio::fs::read_to_string(&path)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn clipboard_read_text() -> Result<String, String> {
    Ok("".to_string())
}

#[tauri::command]
pub async fn clipboard_write_text(app: AppHandle, text: String) -> Result<(), String> {
    use tauri_plugin_clipboard_manager::ClipboardExt;
    app.clipboard().write_text(&text).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn clipboard_write_image(_app: AppHandle, data_url: String) -> Result<(), String> {
    let base64_data = data_url
        .split(',')
        .nth(1)
        .ok_or("Invalid data URL")?;
    let bytes = base64::engine::general_purpose::STANDARD.decode(base64_data.as_bytes()).map_err(|e| e.to_string())?;
    let _ = bytes;
    Ok(())
}

#[tauri::command]
pub async fn set_visible_hotkey(
    app: AppHandle,
    keys: String,
) -> Result<(), String> {
    let manager = HotkeyManager::new(app);
    manager.register_visible_hotkey(keys).await
}

#[tauri::command]
pub async fn set_translate_hotkey(
    app: AppHandle,
    keys: String,
) -> Result<(), String> {
    let manager = HotkeyManager::new(app);
    manager.register_translate_hotkey(keys).await
}

#[tauri::command]
pub async fn openai_chat(
    _app: AppHandle,
    _params: serde_json::Value,
) -> Result<String, String> {
    // Implement OpenAI chat
    Ok("".to_string())
}

#[tauri::command]
pub async fn openai_update_config(
    _app: AppHandle,
    _api_key: String,
    _base_url: String,
) -> Result<(), String> {
    // Implement OpenAI config update
    Ok(())
}

#[derive(serde::Deserialize)]
pub struct ProxyConfig {
    mode: Option<String>,
    #[serde(rename = "proxyRules")]
    proxy_rules: Option<String>,
}

#[tauri::command]
pub async fn set_proxy(
    _app: AppHandle,
    config: ProxyConfig,
) -> Result<(), String> {
    // Implement proxy configuration
        // 从 config 里读取模式
    // let mode = config.get("mode").and_then(|v| v.as_str());
    let mode = config.mode.as_deref();
    // 从 config 里读取代理规则
    let proxy_rules = config.proxy_rules.as_deref();

    // 根据不同模式处理
    match mode {
        Some("system") => {
            log::info!("Using system proxy settings");
            // TODO: 调用系统接口或者库设置系统代理
        },
        Some("direct") => {
            log::info!("Direct connection, no proxy");
            // TODO: 清除代理
        },
        _ => {
            if let Some(rules) = proxy_rules {
                log::info!("Setting custom proxy rules: {}", rules);
                // TODO: 设置 HTTP 或 SOCKS 代理
            } else {
                log::info!("No valid proxy configuration provided");
            }
        }
    }

    Ok(())
}

#[tauri::command]
pub async fn get_fake_ua() -> Result<String, String> {
    Ok("".to_string())
}

#[tauri::command]
pub async fn sync_multi_window_store(
    _app: AppHandle,
    _config: serde_json::Value,
) -> Result<(), String> {
    // Implement multi-window store sync
    Ok(())
}

#[tauri::command]
pub async fn registry_webview(
    _app: AppHandle,
    _config: i32,
) -> Result<(), String> {
    // Implement webview registry
    Ok(())
}