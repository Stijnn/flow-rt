use serde::{Deserialize, Serialize};

use crate::implement_trait_from_json_file;

pub(super) mod helpers;

#[derive(Serialize, Deserialize, Clone, Default, Debug)]
pub struct FileReference {
    pub full_path: String,
}

#[derive(Serialize, Deserialize, Clone, Default, Debug)]
pub struct FlowProject {
    pub flow_graphs: Vec<FlowGraph>,
    pub file_reference: Option<FileReference>,
}

#[derive(Serialize, Deserialize, Clone, Default, Debug)]
pub struct FlowGraph {
    pub nodes: Option<Vec<FlowGraphNode>>,
    pub edges: Option<Vec<FlowGraphEdge>>,
    pub viewport: Option<Viewport>,
    pub file_reference: Option<FileReference>,
}

#[derive(Serialize, Deserialize, Clone, Default, Debug)]
pub struct FlowGraphNode {
    pub id: String,
    #[serde(rename = "type")]
    pub node_type: String,
    pub position: Position,
    #[serde(rename = "measured")]
    pub measurement: Measurement,
    pub data: serde_json::Value,
}

#[derive(Serialize, Deserialize, Clone, Default, Debug)]
pub struct FlowGraphEdge {
    pub id: String,
    #[serde(rename = "type")]
    pub edge_type: String,
    pub source: String,
    pub target: String,
}

#[derive(Serialize, Deserialize, Clone, Default, Debug)]
pub struct Position {
    pub x: f32,
    pub y: f32,
}

#[derive(Serialize, Deserialize, Clone, Default, Debug)]
pub struct Measurement {
    pub width: f32,
    pub height: f32,
}

#[derive(Serialize, Deserialize, Clone, Default, Debug)]
pub struct Viewport {
    pub x: f32,
    pub y: f32,
    pub zoom: f32,
}

implement_trait_from_json_file!([FlowGraph, FlowProject]);
