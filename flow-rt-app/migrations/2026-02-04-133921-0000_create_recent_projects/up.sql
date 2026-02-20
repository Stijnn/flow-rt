-- Your SQL goes here
CREATE TABLE recent_project (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    -- Reference to the main project table
    project_id INTEGER NOT NULL,
    opened_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Key Constraint
    FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
);