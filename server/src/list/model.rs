use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct List {
    pub uuid: String,
    pub project_uuid: String,
    pub title: String,
}
