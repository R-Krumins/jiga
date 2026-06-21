use crate::{
    error::{ApiErr, ApiResult},
    list::List,
    state::AppState,
    task::Task,
};
use axum::{Json, Router, extract::State, routing::post};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct Project {
    pub uuid: String,
    pub title: String,
    pub lists: Vec<List>,
    pub tasks: Vec<Task>,
}

pub fn router() -> Router<AppState> {
    Router::new().route("/", post(create_project))
}

async fn create_project(
    State(state): State<AppState>,
    Json(payload): Json<Project>,
) -> ApiResult<()> {
    let error = |e| {
        eprintln!("{e}");
        ApiErr::internal("could not create project")
    };

    let mut tx = state.db().begin().await.map_err(error)?;

    sqlx::query!(
        "INSERT INTO projects (uuid, title) VALUES (?1, ?2)",
        payload.uuid,
        payload.title
    )
    .execute(&mut *tx)
    .await
    .map_err(error)?;

    for list in &payload.lists {
        sqlx::query!(
            "INSERT INTO lists (uuid, project_uuid, title) VALUES (?1, ?2, ?3)",
            list.uuid,
            payload.uuid,
            list.title
        )
        .execute(&mut *tx)
        .await
        .map_err(error)?;
    }

    tx.commit().await.map_err(error)?;

    Ok(())
}
