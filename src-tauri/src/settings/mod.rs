use serde::{Deserialize, Deserializer, Serialize, Serializer};

#[derive(Debug, Default, Clone)]
pub struct Version {
    pub major: u8,
    pub minor: u8,
    pub patch: u8,
}

impl Serialize for Version {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        serializer.serialize_u32(
            (self.major as u32) | (self.minor as u32) << 8 | (self.patch as u32) << 16,
        )
    }
}

impl<'de> Deserialize<'de> for Version {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        let packed = u32::deserialize(deserializer)?;
        Ok(Version {
            major: (packed & 0xFF) as u8,
            minor: ((packed >> 8) & 0xFF) as u8,
            patch: ((packed >> 16) & 0xFF) as u8,
        })
    }
}

#[derive(Serialize, Deserialize, Default, Debug, Clone)]
pub struct AppSettings {
    version: Version,
}
