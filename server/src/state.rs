use std::sync::Arc;

use sqlx::SqlitePool;

#[derive(Clone)]
pub struct AppState {
    inner: Arc<AppStateInner>,
}

struct AppStateInner {
    pool: SqlitePool,
}

impl AppState {
    pub async fn new(database_url: &str) -> Self {
        let pool = sqlx::SqlitePool::connect(database_url).await.unwrap();
        Self {
            inner: Arc::new(AppStateInner { pool }),
        }
    }

    pub fn db(&self) -> SqlitePool {
        self.inner.pool.clone()
    }
}
