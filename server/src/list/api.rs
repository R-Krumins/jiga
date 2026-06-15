use super::repo;
use crate::{
    error::{ApiErr, ApiResult},
    list::model::List,
    state::AppState,
};
use axum::{Json, Router, extract::State, routing::get};

pub fn router() -> Router<AppState> {
    Router::new().route("/", get(get_lists))
}

async fn get_lists(State(state): State<AppState>) -> ApiResult<Json<Vec<List>>> {
    let lists = repo::get_lists(&state.db()).await.map_err(|e| {
        println!("{e}");
        ApiErr::internal("could not fetch lists")
    })?;
    Ok(Json(lists))
}
