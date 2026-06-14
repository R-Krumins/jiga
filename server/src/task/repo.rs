use anyhow::Context;
use sqlx::SqlitePool;

use crate::task::model::{NewTask, Task};

pub async fn get_tasks(db: &SqlitePool) -> anyhow::Result<Vec<Task>> {
    sqlx::query_as!(Task, "SELECT * FROM tasks")
        .fetch_all(db)
        .await
        .context("could not retrieve tasks")
}

pub async fn create_task(db: &SqlitePool, new_task: &NewTask) -> anyhow::Result<i64> {
    sqlx::query!(
        "INSERT INTO tasks (text, status_id) VALUES (?1, ?2)",
        new_task.text,
        new_task.status_id
    )
    .execute(db)
    .await
    .map(|res| res.last_insert_rowid())
    .context("could not save task")
}

pub async fn delete_task(db: &SqlitePool, id: i64) -> anyhow::Result<()> {
    sqlx::query!("DELETE FROM tasks WHERE id = ?1", id)
        .execute(db)
        .await
        .context("could not delete task")?;
    Ok(())
}

pub async fn update_task(db: &SqlitePool, task: &Task) -> anyhow::Result<()> {
    sqlx::query!(
        "UPDATE tasks SET text = ?1, status_id = ?2 WHERE id = ?3",
        task.text,
        task.status_id,
        task.id,
    )
    .execute(db)
    .await
    .context("could not update task")?;
    Ok(())
}

pub async fn move_task(db: &SqlitePool, task_id: i64, status_id: &str) -> anyhow::Result<()> {
    sqlx::query!(
        "UPDATE tasks SET status_id = ? WHERE id = ?",
        status_id,
        task_id
    )
    .execute(db)
    .await
    .context("could not update task status")?;
    Ok(())
}
