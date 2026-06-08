use super::Task;
use crate::load_data;
use crate::prelude::*;
use crate::save_data;

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AddTask {
    text: String,
    status_id: String,
}

pub async fn create_task(
    State(state): State<AppState>,
    Json(payload): Json<AddTask>,
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
