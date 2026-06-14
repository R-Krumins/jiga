use axum::{Router, routing::get};
use state::AppState;
use std::{env, fs};

mod config;
mod error;
mod state;

mod project {
    pub mod api;
    pub mod model;
}

mod status {
    pub mod model;
    pub mod repo;
}

mod task {
    pub mod api;
    pub mod model;
    pub mod repo;
}

#[tokio::main]
async fn main() {
    load_dotenv();

    let cfg = config::Config::new();
    let state = AppState::new(&cfg.database_url).await;

    let app = Router::new()
        .route("/", get(|| async { "Hello, World!" }))
        .nest("/api/project", project::api::router())
        .nest("/api/project/task", task::api::router())
        .with_state(state);

    let addr = std::net::SocketAddr::from(([0, 0, 0, 0], cfg.port));
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    println!("Listening on port {}...", cfg.port);
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
