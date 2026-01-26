pub enum GraphILOpCodes {
    LoadLibrary(String),
    InvokeLibrary(String, String, String),
}

impl GraphILOpCodes {
    pub fn to_op_code(&self) -> &[u8] {
        match self {
            GraphILOpCodes::LoadLibrary(_) => todo!(),
            GraphILOpCodes::InvokeLibrary(_, _, _) => todo!(),
        }
    }
}

pub struct InMemoryGraphImageBuilder {
    pub magic: [u8; 7],
    pub libraries: Vec<String>,
}

impl InMemoryGraphImageBuilder {
    pub fn new() -> Self {
        Self { magic: *b"GRAPHIL", libraries: vec![] }
    }

    pub fn add_library(&mut self, lib_name: &str) -> &mut Self {
        self.libraries.push(format!("{lib_name}\0"));
        self
    }

    pub fn to_binary(&self) -> Vec<u8> {
        let mut binary = Vec::with_capacity(128);

        binary.extend_from_slice(&self.magic);

        let lib_count = self.libraries.len() as u32;
        binary.extend_from_slice(&lib_count.to_le_bytes());

        for lib in &self.libraries {
            binary.extend_from_slice(lib.as_bytes());
        }

        binary
    }
}

#[cfg(test)]
mod vm_compilation_tests {
    use crate::graphs::instructions::InMemoryGraphImageBuilder;

    #[test]
    fn test_create_headers_for_binary() {
        let img = InMemoryGraphImageBuilder::new()
            .add_library("nmap")
            .add_library("some_other_lib")
            .add_library("another_lib")
            .add_library("yet_another_lib")
            .to_binary();

        println!("{img:0x?}");
    }

}