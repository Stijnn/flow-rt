use chrono::NaiveDateTime;
use diesel::prelude::*;

#[derive(Queryable, Selectable)]
#[diesel(table_name = crate::schema::project)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct TrackedProject {
    pub id: i32,
    pub title: String,
    pub directory_location: String,
}

#[derive(Insertable)]
#[diesel(table_name = crate::schema::project)]
pub struct NewTrackedProject {
    pub title: String,
    pub directory_location: String,
}

#[derive(Queryable, Selectable, Insertable, Associations, Debug)]
#[diesel(belongs_to(TrackedProject, foreign_key = project_id))] // Points to the Struct
#[diesel(table_name = crate::schema::recent_project)]
pub struct RecentProject {
    pub id: i32,
    pub project_id: i32,
    pub opened_at: NaiveDateTime,
}
