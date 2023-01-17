use static_files::resource_dir;

fn main() -> std::io::Result<()> {
    println!("cargo:rerun-if-changed=../../frontend/dist");
    resource_dir("../../frontend/dist").build()
}
