// @generated automatically by Diesel CLI.

diesel::table! {
    project (id) {
        id -> Integer,
        title -> Text,
        directory_location -> Text,
    }
}

diesel::table! {
    recent_project (id) {
        id -> Integer,
        project_id -> Integer,
        opened_at -> Timestamp,
    }
}

diesel::allow_tables_to_appear_in_same_query!(project, recent_project,);
