use axum::{
    Json,
    extract::{Path, State},
};
use serde::{Deserialize, Serialize};

use crate::state::AppState;

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Task {
    id: i64,
    text: String,
    status_id: String,
}

#[derive(Serialize, Deserialize)]
pub struct Status {
    id: String,
    title: String,
}

#[derive(Serialize, Deserialize)]
pub struct Project {
    tasks: Vec<Task>,
    statuses: Vec<Status>,
}

pub async fn get_project(State(state): State<AppState>) -> Result<Json<Project>, String> {
    let db = state.db();
    let tasks = sqlx::query_as!(Task, "select * from tasks")
        .fetch_all(&db)
        .await
        .map_err(|e| {
            eprint!("{e}");
            "could not fetch tasks"
        })?;

    let statuses = sqlx::query_as!(Status, "select * from statuses")
        .fetch_all(&db)
        .await
        .map_err(|e| {
            eprint!("{e}");
            "could not fetch statuses"
        })?;

    Ok(Json(Project { statuses, tasks }))
}

pub async fn move_task(
    State(state): State<AppState>,
    Path((task_id, status_id)): Path<(i64, String)>,
) -> Result<(), String> {
    sqlx::query!(
        "update tasks set status_id = ? where id = ?",
        status_id,
        task_id
    )
    .execute(&state.db())
    .await
    .map_err(|e| {
        eprint!("{e}");
        "could not move task"
    })?;

    Ok(())
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateTask {
    text: String,
    status_id: String,
}

#[derive(Serialize)]
pub struct Id {
    id: i64,
}

pub async fn create_task(
    State(state): State<AppState>,
    Json(payload): Json<CreateTask>,
) -> Result<Json<Id>, &'static str> {
    sqlx::query!(
        "INSERT INTO tasks (text, status_id) VALUES (?1, ?2)",
        payload.text,
        payload.status_id
    )
    .execute(&state.db())
    .await
    .map_err(|e| {
        eprint!("{e}");
        "could create task"
    })
    .map(|res| {
        Json(Id {
            id: res.last_insert_rowid(),
        })
    })
}

pub async fn delete_task(
    State(state): State<AppState>,
    Path(task_id): Path<i64>,
) -> Result<(), &'static str> {
    sqlx::query!("DELETE FROM tasks WHERE id = ?1", task_id)
        .execute(&state.db())
        .await
        .map_err(|e| {
            eprintln!("{e}");
            "could not delete task"
        })
        .map(|_| ())
}
