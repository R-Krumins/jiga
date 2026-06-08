use crate::load_data;
use crate::prelude::*;
use crate::save_data;

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Task {
    id: u32,
    text: String,
    status_id: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateTask {
    text: String,
    status_id: String,
}

#[derive(Deserialize)]
pub struct UpdateTask {
    text: String,
}

pub async fn create(
    State(state): State<AppState>,
    Json(payload): Json<CreateTask>,
) -> Result<Json<Task>, String> {
    let mut data = load_data(state.data_path())?;
    let id = data.tasks.iter().map(|task| task.id).max().unwrap_or(0) + 1;
    let new_task = Task {
        id,
        text: payload.text,
        status_id: payload.status_id,
    };
    data.tasks.push(new_task.clone());
    save_data(state.data_path(), &data)?;
    Ok(Json(new_task))
}

pub async fn update(
    State(state): State<AppState>,
    Path(id): Path<u32>,
    Json(payload): Json<UpdateTask>,
) -> Result<Json<Task>, String> {
    let mut data = load_data(state.data_path())?;
    let task = data
        .tasks
        .iter_mut()
        .find(|t| t.id == id)
        .ok_or("task not found")?;
    task.text = payload.text;
    let task = task.clone();
    save_data(state.data_path(), &data)?;
    Ok(Json(task))
}

pub async fn delete(State(state): State<AppState>, Path(id): Path<u32>) -> Result<(), String> {
    let mut data = load_data(state.data_path())?;
    data.tasks.retain(|t| t.id != id);
    save_data(state.data_path(), &data)?;
    println!("Deleted task #{id}");
    Ok(())
}
