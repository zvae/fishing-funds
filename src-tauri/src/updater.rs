use tauri::AppHandle;

pub fn setup_updater(_app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    Ok(())
}

pub async fn check_update(_app: &AppHandle) {
    log::info!("Update check not implemented");
}