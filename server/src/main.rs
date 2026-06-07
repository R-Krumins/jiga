use axum::{
    Json, Router,
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    routing::{delete, get, post},
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
        .route("/api/project", post(save_project))
        .route("/api/project/task", post(add_task))
        .route("/api/project/task/{id}", delete(delete_task))
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

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
struct Task {
    id: u32,
    text: String,
    status_id: String,
}

#[derive(Serialize, Deserialize)]
struct Status {
    id: String,
    title: String,
}

#[derive(Serialize, Deserialize)]
struct Project {
    statuses: Vec<Status>,
    tasks: Vec<Task>,
}

async fn get_project(State(state): State<AppState>) -> Result<impl IntoResponse, String> {
    let data = load_data_plain(state.data_path())?;
    Ok((StatusCode::OK, [("content-type", "application/json")], data))
}

async fn save_project(
    State(state): State<AppState>,
    Json(data): Json<Project>,
) -> Result<(), String> {
    save_data(state.data_path(), &data)?;
    println!("Saved data");
    Ok(())
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct AddTask {
    text: String,
    status_id: String,
}

async fn add_task(
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

async fn delete_task(State(state): State<AppState>, Path(id): Path<u32>) -> Result<(), String> {
    let mut data = load_data(state.data_path())?;
    data.tasks.retain(|t| t.id != id);
    save_data(state.data_path(), &data)?;
    println!("Deleted task #{id}");
    Ok(())
}

fn save_data(data_path: &str, data: &Project) -> Result<(), &'static str> {
    let json = serde_json::to_string(&data).map_err(|e| {
        eprintln!("{e}");
        "internal error"
    })?;

    fs::write(data_path, json).map_err(|e| {
        eprintln!("{e}");
        "could not save data"
    })
}

fn load_data_plain(data_path: &str) -> Result<String, &str> {
    fs::read_to_string(data_path).map_err(|e| {
        eprintln!("{e}");
        "could not read data file"
    })
}

fn load_data(data_path: &str) -> Result<Project, &str> {
    let plain = load_data_plain(data_path)?;
    serde_json::from_str(&plain).map_err(|e| {
        eprintln!("{e}");
        "could not read data file"
    })
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
