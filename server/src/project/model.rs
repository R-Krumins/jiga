use serde::Serialize;

use crate::{status::model::Status, task::model::Task};

#[derive(Serialize)]
pub struct Project {
    pub tasks: Vec<Task>,
    pub statuses: Vec<Status>,
}
