use std::sync::Arc;
use tokio::sync::Mutex;
use tauri::{AppHandle, Manager};
use tauri_plugin_global_shortcut::{GlobalShortcutExt, Shortcut, ShortcutState};

pub struct HotkeyManager {
    app: AppHandle,
    visible_hotkey: Arc<Mutex<Option<String>>>,
    translate_hotkey: Arc<Mutex<Option<String>>>,
}

impl HotkeyManager {
    pub fn new(app: AppHandle) -> Self {
        Self {
            app,
            visible_hotkey: Arc::new(Mutex::new(None)),
            translate_hotkey: Arc::new(Mutex::new(None)),
        }
    }
    
    pub async fn register_visible_hotkey(&self, keys: String) -> Result<(), String> {
        let mut hotkey = self.visible_hotkey.lock().await;
        
        // Unregister old hotkey if exists
        if let Some(old_keys) = hotkey.as_ref() {
            if let Ok(shortcut) = old_keys.parse::<Shortcut>() {
                let _ = self.app.global_shortcut().unregister(shortcut);
            }
        }
        
        if keys.is_empty() {
            *hotkey = None;
            return Ok(());
        }
        
        let shortcut = keys
            .parse::<Shortcut>()
            .map_err(|e| format!("Invalid shortcut: {}", e))?;
        
        let app = self.app.clone();
        self.app
            .global_shortcut()
            .on_shortcut(shortcut, move |_app, _shortcut, event| {
                if event.state == ShortcutState::Pressed {
                    if let Some(window) = app.get_webview_window("main") {
                        if window.is_visible().unwrap_or(false) {
                            let _ = window.hide();
                        } else {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                }
            })
            .map_err(|e| e.to_string())?;
        
        *hotkey = Some(keys);
        Ok(())
    }
    
    pub async fn register_translate_hotkey(&self, keys: String) -> Result<(), String> {
        let mut hotkey = self.translate_hotkey.lock().await;
        
        // Unregister old hotkey if exists
        if let Some(old_keys) = hotkey.as_ref() {
            if let Ok(shortcut) = old_keys.parse::<Shortcut>() {
                let _ = self.app.global_shortcut().unregister(shortcut);
            }
        }
        
        if keys.is_empty() {
            *hotkey = None;
            return Ok(());
        }
        
        let shortcut = keys
            .parse::<Shortcut>()
            .map_err(|e| format!("Invalid shortcut: {}", e))?;
        
        let app = self.app.clone();
        self.app
            .global_shortcut()
            .on_shortcut(shortcut, move |_app, _shortcut, event| {
                if event.state == ShortcutState::Pressed {
                    if let Some(window) = app.get_webview_window("main") {
                        let visible = window.is_visible().unwrap_or(false);
                        let _ = visible;
                    }
                }
            })
            .map_err(|e| e.to_string())?;
        
        *hotkey = Some(keys);
        Ok(())
    }
}

pub fn setup_hotkeys(_app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    // Hotkeys will be registered dynamically via commands
    Ok(())
}