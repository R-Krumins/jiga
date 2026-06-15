use super::model::Task;
use super::repo;
use crate::{
    error::{ApiErr, ApiResult},
    state::AppState,
};
use axum::extract::Path;
use axum::routing::{delete, patch, post, put};
use axum::{Json, extract::State};
use axum::{Router, routing::get};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/", get(get_tasks))
        .route("/", post(create_task))
        .route("/", put(update_task))
        .route("/{id}", delete(delete_task))
        .route("/{id}/move/{status_id}", patch(move_task))
}

async fn get_tasks(State(state): State<AppState>) -> ApiResult<Json<Vec<Task>>> {
    let tasks = repo::get_tasks(&state.db()).await.map_err(|e| {
        eprintln!("{e}");
        ApiErr::internal("could not fetch tasks")
    })?;
    Ok(Json(tasks))
}

async fn create_task(
    State(state): State<AppState>,
    Json(payload): Json<Task>,
) -> ApiResult<Json<serde_json::Value>> {
    let id = repo::create_task(&state.db(), &payload)
        .await
        .map_err(|e| {
            eprintln!("{e}");
            ApiErr::bad_request("could not create task")
        })?;
    Ok(Json(serde_json::json!({ "id": id })))
}

async fn update_task(State(state): State<AppState>, Json(payload): Json<Task>) -> ApiResult<()> {
    repo::update_task(&state.db(), &payload)
        .await
        .map_err(|e| {
            eprintln!("{e}");
            ApiErr::bad_request("could not update task")
        })?;
    Ok(())
}

async fn delete_task(State(state): State<AppState>, Path(uuid): Path<String>) -> ApiResult<()> {
    repo::delete_task(&state.db(), &uuid).await.map_err(|e| {
        eprintln!("{e}");
        ApiErr::bad_request("could not delete task")
    })?;
    Ok(())
}

async fn move_task(
    State(state): State<AppState>,
    Path((task_uuid, list_uuid)): Path<(String, String)>,
) -> ApiResult<()> {
    repo::move_task(&state.db(), &task_uuid, &list_uuid)
        .await
        .map_err(|e| {
            eprintln!("{e}");
            ApiErr::bad_request("could not move task")
        })?;
    Ok(())
}
