use crate::load_data;
use crate::prelude::*;
use crate::save_data;

pub async fn delete_task(State(state): State<AppState>, Path(id): Path<u32>) -> Result<(), String> {
    let mut data = load_data(state.data_path())?;
    data.tasks.retain(|t| t.id != id);
    save_data(state.data_path(), &data)?;
    println!("Deleted task #{id}");
    Ok(())
}
