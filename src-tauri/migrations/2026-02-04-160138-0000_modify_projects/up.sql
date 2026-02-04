-- Your SQL goes here
CREATE TABLE project_dg_tmp (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    directory_location TEXT NOT NULL UNIQUE
);

INSERT OR IGNORE INTO project_dg_tmp (id, title, directory_location)
SELECT id, title, directory_location FROM project;

DROP TABLE project;
ALTER TABLE project_dg_tmp RENAME TO project;