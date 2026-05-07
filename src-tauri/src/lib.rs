mod commands;
mod http_client;
mod hotkey;
mod store;
mod tray;
mod updater;

use tauri::Manager;
use tauri_plugin_autostart::MacosLauncher;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_autostart::init(MacosLauncher::LaunchAgent, Some(vec!["--flag1", "--flag2"]),))
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            let _ = app.get_webview_window("main").unwrap().set_focus();
        }))
        .setup(|app| {
            let handle = app.handle();
            
            // Initialize store
            store::init_stores(handle)?;
            
            // Setup system tray
            tray::setup_tray(handle)?;
            
            // Setup updater
            updater::setup_updater(handle)?;
            
            // Setup hotkeys
            hotkey::setup_hotkeys(handle)?;
            
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::get_storage_config,
            commands::set_storage_config,
            commands::delete_storage_config,
            commands::cover_storage_config,
            commands::all_storage_config,
            commands::show_message_box,
            commands::show_save_dialog,
            commands::show_open_dialog,
            commands::set_login_item_settings,
            commands::app_quit,
            commands::app_relaunch,
            commands::get_version,
            commands::get_platform,
            commands::get_should_use_dark_colors,
            commands::set_tray_content,
            commands::set_menubar_visible,
            commands::check_update,
            commands::shell_open_external,
            commands::request,
            commands::io_save_image,
            commands::io_save_json_to_csv,
            commands::io_save_string,
            commands::io_read_string_file,
            commands::clipboard_read_text,
            commands::clipboard_write_text,
            commands::clipboard_write_image,
            commands::set_visible_hotkey,
            commands::set_translate_hotkey,
            commands::openai_chat,
            commands::openai_update_config,
            commands::set_proxy,
            commands::get_fake_ua,
            commands::sync_multi_window_store,
            commands::registry_webview,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}