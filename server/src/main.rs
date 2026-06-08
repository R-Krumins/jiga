use prelude::*;
use state::AppState;
use std::{env, fs};

mod prelude;
mod state;
mod task;

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
        .route("/api/project/task", post(task::create_task))
        .route("/api/project/task/{id}", delete(task::delete_task))
        .route("/api/project/task/{id}", patch(task::update_task))
        .with_state(state);

    let addr = std::net::SocketAddr::from(([0, 0, 0, 0], port));
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    println!("Listening on port {port}...");
    axum::serve(listener, app).await.unwrap();
}

#[derive(Serialize, Deserialize)]
struct Status {
    id: String,
    title: String,
}

#[derive(Serialize, Deserialize)]
struct Project {
    statuses: Vec<Status>,
    tasks: Vec<task::Task>,
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
