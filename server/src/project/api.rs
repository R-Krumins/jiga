use axum::{Json, Router, extract::State, routing::get};

use crate::{
    error::{ApiErr, ApiResult},
    project::model::Project,
    state::AppState,
    status, task,
};

pub fn router() -> Router<AppState> {
    Router::new().route("/", get(get_project))
}

pub async fn get_project(State(state): State<AppState>) -> ApiResult<Json<Project>> {
    let error = || ApiErr::internal("could not retrieve project");
    let db = state.db();

    let tasks = task::repo::get_tasks(&db).await.map_err(|e| {
        eprintln!("{e}");
        error()
    })?;

    let statuses = status::repo::get_statuses(&db).await.map_err(|e| {
        eprintln!("{e}");
        error()
    })?;

    Ok(Json(Project { tasks, statuses }))
}
