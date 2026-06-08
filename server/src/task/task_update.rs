use super::Task;
use crate::load_data;
use crate::prelude::*;
use crate::save_data;

#[derive(Serialize, Deserialize)]
pub struct UpdateTask {
    text: String,
}

pub async fn update_task(
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
