use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Task {
    pub uuid: String,
    pub text: String,
    pub list_uuid: String,
}
