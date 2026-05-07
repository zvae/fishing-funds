use tauri::{AppHandle, Manager};
use tauri_plugin_updater::UpdaterExt;

pub fn setup_updater(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    // Updater is initialized via plugin
    Ok(())
}

pub async fn check_update(app: &AppHandle) {
    if let Some(updater) = app.updater() {
        match updater.check().await {
            Ok(update) => {
                if let Some(update) = update {
                    log::info!("Update available: {:?}", update.version);
                    // Notify frontend about available update
                    app.emit("update-available", update).ok();
                } else {
                    log::info!("No update available");
                }
            }
            Err(e) => {
                log::error!("Failed to check for updates: {}", e);
            }
        }
    }
}