use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum StoreType {
    Config,
    Cache,
    State,
}

impl std::fmt::Display for StoreType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            StoreType::Config => write!(f, "config"),
            StoreType::Cache => write!(f, "cache"),
            StoreType::State => write!(f, "state"),
        }
    }
}

pub fn init_stores(app: &tauri::AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    use tauri_plugin_store::StoreExt;
    
    app.store("config")?;
    app.store("cache")?;
    app.store("state")?;
    
    Ok(())
}