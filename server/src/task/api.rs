use super::model::{NewTask, Task};
use super::repo;
use crate::error::ApiErr;
use crate::{error::ApiResult, state::AppState};
use axum::Router;
use axum::extract::Path;
use axum::routing::{delete, patch, post, put};
use axum::{Json, extract::State};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/", post(create_task))
        .route("/", put(update_task))
        .route("/{id}", delete(delete_task))
        .route("/{id}/move/{status_id}", patch(move_task))
}

async fn create_task(
    State(state): State<AppState>,
    Json(payload): Json<NewTask>,
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

async fn delete_task(State(state): State<AppState>, Path(id): Path<i64>) -> ApiResult<()> {
    repo::delete_task(&state.db(), id).await.map_err(|e| {
        eprintln!("{e}");
        ApiErr::bad_request("could not delete task")
    })?;
    Ok(())
}

async fn move_task(
    State(state): State<AppState>,
    Path((task_id, status_id)): Path<(i64, String)>,
) -> ApiResult<()> {
    repo::move_task(&state.db(), task_id, &status_id)
        .await
        .map_err(|e| {
            eprintln!("{e}");
            ApiErr::bad_request("could not move task")
        })?;
    Ok(())
}
