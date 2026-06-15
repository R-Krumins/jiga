use anyhow::Context;
use sqlx::SqlitePool;

use crate::task::model::Task;

pub async fn get_tasks(db: &SqlitePool) -> anyhow::Result<Vec<Task>> {
    sqlx::query_as!(Task, "SELECT * FROM tasks")
        .fetch_all(db)
        .await
        .context("could not retrieve tasks")
}

pub async fn create_task(db: &SqlitePool, new_task: &Task) -> anyhow::Result<i64> {
    sqlx::query!(
        "INSERT INTO tasks (uuid, text, list_uuid) VALUES (?1, ?2, ?3)",
        new_task.uuid,
        new_task.text,
        new_task.list_uuid
    )
    .execute(db)
    .await
    .map(|res| res.last_insert_rowid())
    .context("could not save task")
}

pub async fn delete_task(db: &SqlitePool, uuid: &str) -> anyhow::Result<()> {
    sqlx::query!("DELETE FROM tasks WHERE uuid = ?1", uuid)
        .execute(db)
        .await
        .context("could not delete task")?;
    Ok(())
}

pub async fn update_task(db: &SqlitePool, task: &Task) -> anyhow::Result<()> {
    sqlx::query!(
        "UPDATE tasks SET text = ?1, list_uuid = ?2 WHERE uuid = ?3",
        task.text,
        task.list_uuid,
        task.uuid,
    )
    .execute(db)
    .await
    .context("could not update task")?;
    Ok(())
}

pub async fn move_task(db: &SqlitePool, task_uuid: &str, list_uuid: &str) -> anyhow::Result<()> {
    sqlx::query!(
        "UPDATE tasks SET list_uuid = ? WHERE uuid = ?",
        list_uuid,
        task_uuid
    )
    .execute(db)
    .await
    .context("could not update task status")?;
    Ok(())
}
