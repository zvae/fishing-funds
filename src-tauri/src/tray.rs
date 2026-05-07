use tauri::{AppHandle, Manager};
use tauri::menu::{Menu, MenuItem};
use tauri::tray::TrayIconBuilder;

pub fn setup_tray(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    let quit_item = MenuItem::with_id(app, "quit", "退出", true, None::<&str>)?;
    let show_item = MenuItem::with_id(app, "show", "显示", true, None::<&str>)?;
    let check_update_item = MenuItem::with_id(app, "check_update", "检查更新", true, None::<&str>)?;
    
    let menu = Menu::with_items(app, &[&show_item, &check_update_item, &quit_item])?;
    
    let _tray = TrayIconBuilder::with_id("main")
        .icon(app.default_window_icon().unwrap().clone())
        .menu(&menu)
        .on_menu_event(|app, event| {
            match event.id().as_ref() {
                "quit" => {
                    app.exit(0);
                }
                "show" => {
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.show();
                        let _ = window.set_focus();
                    }
                }
                "check_update" => {
                    crate::updater::check_update(app);
                }
                _ => {}
            }
        })
        .build(app)?;
    
    Ok(())
}