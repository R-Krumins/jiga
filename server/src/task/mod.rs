use serde::{Deserialize, Serialize};

mod task_create;
mod task_delete;
mod task_update;

pub use task_create::create_task;
pub use task_delete::delete_task;
pub use task_update::update_task;

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Task {
    id: u32,
    text: String,
    status_id: String,
}
