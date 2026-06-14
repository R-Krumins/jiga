use super::model::Status;
use anyhow::Context;
use sqlx::SqlitePool;

pub async fn get_statuses(db: &SqlitePool) -> anyhow::Result<Vec<Status>> {
    sqlx::query_as!(Status, "SELECT * FROM statuses")
        .fetch_all(db)
        .await
        .context("could not retrieve statuses")
}
