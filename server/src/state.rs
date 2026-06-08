use std::sync::Arc;

#[derive(Clone)]
pub struct AppState {
    inner: Arc<AppStateInner>,
}

struct AppStateInner {
    data_path: String,
}

impl AppState {
    pub fn new(data_path: String) -> Self {
        Self {
            inner: Arc::new(AppStateInner { data_path }),
        }
    }

    pub fn data_path(&self) -> &str {
        &self.inner.data_path
    }
}
