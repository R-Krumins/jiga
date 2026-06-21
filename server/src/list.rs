use crate::{
    error::{ApiErr, ApiResult},
    state::AppState,
};
use axum::{Json, Router, extract::State, routing::get};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct List {
    pub uuid: String,
    pub title: String,
}

pub fn router() -> Router<AppState> {
    Router::new().route("/", get(get_lists))
}

async fn get_lists(State(state): State<AppState>) -> ApiResult<Json<Vec<List>>> {
    let lists = sqlx::query_as!(List, "SELECT uuid, title FROM lists")
        .fetch_all(&state.db())
        .await
        .map_err(|e| {
            eprintln!("{e}");
            ApiErr::internal("could not fetch lists")
        })?;

    Ok(Json(lists))
}
