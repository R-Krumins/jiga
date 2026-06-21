use crate::{
    error::{ApiErr, ApiResult},
    list::List,
    state::AppState,
    task::Task,
};
use axum::{
    Json, Router,
    extract::{Path, State},
    routing::{get, post},
};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct Project {
    pub uuid: String,
    pub title: String,
    pub lists: Vec<List>,
    pub tasks: Vec<Task>,
}

#[derive(Serialize)]
pub struct ProjectTitle {
    pub uuid: String,
    pub title: String,
}

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/{project_uuid}", get(get_project))
        .route("/", post(create_project))
        .route("/names", get(get_project_titles))
}

async fn get_project(
    State(state): State<AppState>,
    Path(project_uuid): Path<String>,
) -> ApiResult<Json<Project>> {
    let error = |e| {
        eprintln!("{e}");
        ApiErr::internal(format!("could not fetch project {project_uuid}"))
    };

    let db = state.db();

    let project = sqlx::query_as!(
        ProjectTitle,
        "SELECT uuid, title FROM projects WHERE uuid = ?",
        project_uuid
    )
    .fetch_one(&db)
    .await
    .map_err(error)?;

    let lists = sqlx::query_as!(
        List,
        "SELECT uuid, title FROM lists WHERE project_uuid = ?",
        project_uuid
    )
    .fetch_all(&db)
    .await
    .map_err(error)?;

    let tasks = sqlx::query_as!(
            Task,
            "SELECT uuid, list_uuid, text FROM tasks WHERE list_uuid IN (SELECT uuid FROM lists WHERE project_uuid = ?)",
            project_uuid
        )
        .fetch_all(&db)
        .await
        .map_err(error)?;

    Ok(Json(Project {
        uuid: project_uuid,
        title: project.title,
        lists,
        tasks,
    }))
}

async fn get_project_titles(State(state): State<AppState>) -> ApiResult<Json<Vec<ProjectTitle>>> {
    let names = sqlx::query_as!(ProjectTitle, "SELECT uuid, title FROM projects")
        .fetch_all(&state.db())
        .await
        .map_err(|e| {
            eprintln!("{e}");
            ApiErr::internal("could not fetch project names")
        })?;

    Ok(Json(names))
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
