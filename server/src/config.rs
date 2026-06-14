use std::env::var;

pub struct Config {
    pub database_url: String,
    pub port: u16,
}

impl Config {
    pub fn new() -> Self {
        let database_url = var("DATABASE_URL").expect("DATABASE_URL");
        let port: u16 = var("PORT")
            .map(|v| v.parse::<u16>().expect("PORT must be a valid u16"))
            .unwrap_or(3000);

        Config { database_url, port }
    }
}
