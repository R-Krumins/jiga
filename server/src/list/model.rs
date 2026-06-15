use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct List {
    pub uuid: String,
    pub title: String,
}
