use axum::{
    Json, Router,
    extract::State,
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post},
};
use serde::{Deserialize, Serialize};
use std::{env, fs, sync::Arc};

#[tokio::main]
async fn main() {
    load_dotenv();

    let data_path = env::var("DATA_PATH").expect("DATA_PATH");
    let port: u16 = std::env::var("PORT")
        .map(|v| v.parse::<u16>().expect("PORT must be a valid u16"))
        .unwrap_or(3000);

    let state = AppState::new(data_path);

    let app = Router::new()
        .route("/", get(|| async { "Hello, World!" }))
        .route("/api/project", get(get_project))
        .with_state(state);

    let addr = std::net::SocketAddr::from(([0, 0, 0, 0], port));
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    println!("Listening on port {port}...");
    axum::serve(listener, app).await.unwrap();
}

#[derive(Clone)]
struct AppState {
    inner: Arc<AppStateInner>,
}

impl AppState {
    fn new(data_path: String) -> Self {
        Self {
            inner: Arc::new(AppStateInner { data_path }),
        }
    }

    fn data_path(&self) -> &str {
        &self.inner.data_path
    }
}

struct AppStateInner {
    data_path: String,
}

#[derive(Serialize, Deserialize)]
#[serde(rename = "camelCase")]
struct Task {
    id: u32,
    text: String,
    status_id: String,
}

#[derive(Serialize, Deserialize)]
struct Status {
    id: u32,
    title: String,
}

#[derive(Serialize, Deserialize)]
struct Project {
    statuses: Vec<Status>,
    tasks: Vec<Task>,
}

async fn get_project(State(state): State<AppState>) -> Result<impl IntoResponse, String> {
    let data = fs::read_to_string(state.data_path()).map_err(|e| {
        eprintln!("{e}");
        "could not read data file"
    })?;

    Ok((StatusCode::OK, [("content-type", "application/json")], data))
}

fn load_dotenv() {
    let Ok(dotenv) = fs::read_to_string("./.env") else {
        eprintln!("Warning: missing .env");
        return;
    };
    dotenv
        .lines()
        .filter_map(|line| line.split('#').next()) //ignore comments
        .filter_map(|line| line.split_once("="))
        .map(|(key, val)| (key.trim(), val.trim()))
        .filter(|(key, _)| env::var_os(key).is_none()) //do not overide existing env vars
        .for_each(|(key, val)| unsafe {
            env::set_var(key, val);
        });
}
