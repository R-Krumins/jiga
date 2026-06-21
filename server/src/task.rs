use crate::{
    error::{ApiErr, ApiResult},
    state::AppState,
};
use axum::{
    Json, Router,
    extract::{Path, State},
    routing::{delete, get, patch, post, put},
};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Task {
    pub uuid: String,
    pub text: String,
    pub list_uuid: String,
}

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/", get(get_tasks))
        .route("/", post(create_task))
        .route("/", put(update_task))
        .route("/{id}", delete(delete_task))
        .route("/{id}/move/{status_id}", patch(move_task))
}

async fn get_tasks(State(state): State<AppState>) -> ApiResult<Json<Vec<Task>>> {
    let tasks = sqlx::query_as!(Task, "SELECT * FROM tasks")
        .fetch_all(&state.db())
        .await
        .map_err(|e| {
            eprintln!("{e}");
            ApiErr::internal("could not fetch tasks")
        })?;

    Ok(Json(tasks))
}

async fn create_task(State(state): State<AppState>, Json(payload): Json<Task>) -> ApiResult<()> {
    sqlx::query!(
        "INSERT INTO tasks (uuid, text, list_uuid) VALUES (?1, ?2, ?3)",
        payload.uuid,
        payload.text,
        payload.list_uuid
    )
    .execute(&state.db())
    .await
    .map(|res| res.last_insert_rowid())
    .map_err(|e| {
        eprintln!("{e}");
        ApiErr::bad_request("could not create task")
    })?;
    Ok(())
}

async fn update_task(State(state): State<AppState>, Json(payload): Json<Task>) -> ApiResult<()> {
    sqlx::query!(
        "UPDATE tasks SET text = ?1, list_uuid = ?2 WHERE uuid = ?3",
        payload.text,
        payload.list_uuid,
        payload.uuid,
    )
    .execute(&state.db())
    .await
    .map_err(|e| {
        eprintln!("{e}");
        ApiErr::bad_request("could not update task")
    })?;

    Ok(())
}

async fn delete_task(State(state): State<AppState>, Path(uuid): Path<String>) -> ApiResult<()> {
    sqlx::query!("DELETE FROM tasks WHERE uuid = ?1", uuid)
        .execute(&state.db())
        .await
        .map_err(|e| {
            eprintln!("{e}");
            ApiErr::bad_request("could not delete task")
        })?;

    Ok(())
}

async fn move_task(
    State(state): State<AppState>,
    Path((task_uuid, list_uuid)): Path<(String, String)>,
) -> ApiResult<()> {
    sqlx::query!(
        "UPDATE tasks SET list_uuid = ? WHERE uuid = ?",
        list_uuid,
        task_uuid
    )
    .execute(&state.db())
    .await
    .map_err(|e| {
        eprintln!("{e}");
        ApiErr::bad_request("could not move task")
    })?;

    Ok(())
}
