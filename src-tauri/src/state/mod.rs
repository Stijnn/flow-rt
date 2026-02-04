use std::{path::PathBuf, sync::{Mutex, OnceLock}};

use diesel::{Connection, SqliteConnection};
use diesel_migrations::{EmbeddedMigrations, MigrationHarness, embed_migrations};

const EPH_STATE_DB_MIGRATIONS: EmbeddedMigrations = embed_migrations!("./migrations");

static CONN: OnceLock<Mutex<SqliteConnection>> = OnceLock::new();

fn establish_connection() -> SqliteConnection {
    let state_path = PathBuf::from("C:\\Users\\stijn\\.config\\flow-rt-app\\flow.statedb");
    
    if let Some(parent) = state_path.parent() {
        std::fs::create_dir_all(parent).expect("Could not create config directory");
    }

    let db_url = state_path.to_str().expect("Invalid path");
    SqliteConnection::establish(db_url)
        .unwrap_or_else(|_| panic!("Error connecting to {}", db_url))
}

pub(crate) fn get_connection() -> std::sync::MutexGuard<'static, SqliteConnection> {
    CONN.get_or_init(|| {
        let mut conn = establish_connection();
        conn.run_pending_migrations(EPH_STATE_DB_MIGRATIONS)
            .expect("Failed to run migrations");
        Mutex::new(conn)
    });

    CONN.get()
        .expect("Database not initialized. Call init_state_db first.")
        .lock()
        .expect("Mutex poisoned")
}