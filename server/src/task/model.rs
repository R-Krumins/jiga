use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Task {
    pub id: i64,
    pub text: String,
    pub status_id: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NewTask {
    pub text: String,
    pub status_id: String,
}
