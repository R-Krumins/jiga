use super::model::List;
use anyhow::Context;
use sqlx::SqlitePool;

pub async fn get_lists(db: &SqlitePool) -> anyhow::Result<Vec<List>> {
    sqlx::query_as!(List, "SELECT * FROM lists")
        .fetch_all(db)
        .await
        .context("could not retrieve statuses")
}
