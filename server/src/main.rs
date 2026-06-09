use axum::{
    Router,
    routing::{delete, get, patch, post},
};
use state::AppState;
use std::{env, fs};

mod project;
mod state;

#[tokio::main]
async fn main() {
    load_dotenv();

    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL");
    let port: u16 = std::env::var("PORT")
        .map(|v| v.parse::<u16>().expect("PORT must be a valid u16"))
        .unwrap_or(3000);

    let state = AppState::new(&database_url).await;

    let app = Router::new()
        .route("/", get(|| async { "Hello, World!" }))
        .route("/api/project", get(project::get_project))
        .route("/api/project/task", post(project::create_task))
        .route("/api/project/task/{id}", delete(project::delete_task))
        .route(
            "/api/project/task/{id}/move/{status_id}",
            patch(project::move_task),
        )
        .with_state(state);

    let addr = std::net::SocketAddr::from(([0, 0, 0, 0], port));
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    println!("Listening on port {port}...");
    axum::serve(listener, app).await.unwrap();
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
