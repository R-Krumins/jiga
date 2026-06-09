use crate::prelude::*;

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Task {
    id: i64,
    text: String,
    status_id: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NewTask {
    text: String,
    status_id: String,
}

pub async fn create(
    State(state): State<AppState>,
    Json(payload): Json<NewTask>,
) -> Result<Json<Task>, String> {
    let res = sqlx::query!(
        "INSERT INTO tasks (text, status_id) VALUES (?1, ?2)",
        payload.text,
        payload.status_id
    )
    .execute(&state.db())
    .await
    .map_err(|e| {
        eprint!("{e}");
        "could create task"
    })?;

    let task = Task {
        id: res.last_insert_rowid(),
        text: payload.text,
        status_id: payload.status_id,
    };

    Ok(Json(task))
}

pub async fn update(
    State(state): State<AppState>,
    Json(payload): Json<Task>,
) -> Result<(), String> {
    let row = sqlx::query!(
        "UPDATE tasks SET text = ?1 WHERE id = ?2 RETURNING id, text, status_id",
        payload.text,
        id
    )
    .fetch_optional(&state.db())
    .await
    .map_err(|e| {
        eprintln!("{e}");
        "could not update task"
    })?
    .ok_or("task not found")?;

    let task = Task {
        id: row.id as u32,
        text: row.text,
        status_id: row.status_id,
    };

    Ok(Json(task))
}

pub async fn delete(State(state): State<AppState>, Path(id): Path<u32>) -> Result<(), String> {
    let res = sqlx::query!("DELETE FROM tasks WHERE id = ?1", id)
        .execute(&state.db())
        .await
        .map_err(|e| {
            eprintln!("{e}");
            "could not delete task"
        })?;

    if res.rows_affected() == 0 {
        return Err("task not found".into());
    }

    println!("Deleted task #{id}");
    Ok(())
}
