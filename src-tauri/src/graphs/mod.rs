use serde::{Deserialize, Serialize};

pub mod in_memory_graph;
pub mod instructions;

#[derive(Serialize, Deserialize, Debug, Clone, Copy)]
pub struct GraphViewport {
    pub x: f32,
    pub y: f32,
    pub zoom: f32,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct GraphPosition {
    x: f32,
    y: f32,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct GraphMeasurement {
    width: f32,
    height: f32,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct GraphNode {
    pub id: String,
    #[serde(rename = "type")]
    pub node_type: String,
    pub position: GraphPosition,
    #[serde(rename = "measured")]
    pub measurement: GraphMeasurement,
    pub data: serde_json::Value,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct GraphEdge {
    pub id: String,
    #[serde(rename = "type")]
    pub edge_type: String,
    pub source: String,
    pub target: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct GraphObject {
    pub nodes: Vec<GraphNode>,
    pub edges: Vec<GraphEdge>,
    pub viewport: GraphViewport,
}

impl GraphObject {
    pub fn find_nodes_of_type(&self, node_type: &str) -> Vec<GraphNode> {
        self.nodes
            .iter()
            .filter_map(|node| {
                if node.node_type.eq(node_type) {
                    Some(node.clone())
                } else {
                    None
                }
            })
            .collect()
    }

    pub fn find_edges_of_type(&self, edge_type: &str) -> Vec<GraphEdge> {
        self.edges
            .iter()
            .filter_map(|edge| {
                if edge.edge_type.eq(edge_type) {
                    Some(edge.clone())
                } else {
                    None
                }
            })
            .collect()
    }

    pub fn find_edge(&self, edge_id: &str) -> Option<GraphEdge> {
        self.edges.iter().find_map(|edge| {
            if edge.id.eq(edge_id) {
                Some(edge.clone())
            } else {
                None
            }
        })
    }

    pub fn find_node(&self, node_id: &str) -> Option<GraphNode> {
        self.nodes.iter().find_map(|node| {
            if node.id.eq(node_id) {
                Some(node.clone())
            } else {
                None
            }
        })
    }

    pub fn get_connected_nodes(&self, node_id: &str) -> Vec<GraphNode> {
        self.edges
            .iter()
            .filter_map(|edge| {
                let neighbor_id = if edge.source == node_id {
                    Some(&edge.target)
                } else if edge.target == node_id {
                    Some(&edge.source)
                } else {
                    None
                };
                neighbor_id.and_then(|id| self.nodes.iter().find(|n| n.id == *id).cloned())
            })
            .collect()
    }

    pub fn get_connected_source_nodes(&self, node_id: &str) -> Vec<GraphNode> {
        self.edges
            .iter()
            .filter_map(|edge| {
                let neighbor_id = if edge.target == node_id {
                    Some(&edge.source)
                } else {
                    None
                };
                neighbor_id.and_then(|id| self.nodes.iter().find(|n| n.id == *id).cloned())
            })
            .collect()
    }

    pub fn get_connected_target_nodes(&self, node_id: &str) -> Vec<GraphNode> {
        self.edges
            .iter()
            .filter_map(|edge| {
                let neighbor_id = if edge.source == node_id {
                    Some(&edge.target)
                } else {
                    None
                };
                neighbor_id.and_then(|id| self.nodes.iter().find(|n| n.id == *id).cloned())
            })
            .collect()
    }
}

pub mod graph_tests {
    use crate::graphs::GraphEdge;
    use crate::graphs::{GraphNode, GraphObject, GraphViewport, in_memory_graph::InMemoryGraph};

    pub fn create_from_json() -> GraphObject {
        let object = r#"
        {
            "nodes": [
                {
                "id": "startNode",
                "data": {},
                "type": "startNode",
                "position": {
                    "x": 296,
                    "y": 198
                },
                "measured": {
                    "width": 102,
                    "height": 50
                }
                },
                {
                "id": "scriptNode-c508eb1b-5b7f-48ce-98ca-5a6a0aafdcc7",
                "data": {},
                "type": "scriptNode",
                "position": {
                    "x": 628,
                    "y": 274
                },
                "measured": {
                    "width": 110,
                    "height": 50
                },
                "selected": true,
                "dragging": false
                },
                {
                "id": "scriptNode-493fe4ad-c90e-4ebc-ac57-636d6323de8a",
                "data": {},
                "type": "scriptNode",
                "position": {
                    "x": 1001,
                    "y": 245
                },
                "measured": {
                    "width": 110,
                    "height": 50
                }
                }
            ],
            "edges": [
                {
                "source": "startNode",
                "target": "scriptNode-c508eb1b-5b7f-48ce-98ca-5a6a0aafdcc7",
                "type": "customEdge",
                "id": "xy-edge__startNode-scriptNode-c508eb1b-5b7f-48ce-98ca-5a6a0aafdcc7"
                },
                {
                "source": "scriptNode-c508eb1b-5b7f-48ce-98ca-5a6a0aafdcc7",
                "target": "scriptNode-493fe4ad-c90e-4ebc-ac57-636d6323de8a",
                "type": "customEdge",
                "id": "xy-edge__scriptNode-c508eb1b-5b7f-48ce-98ca-5a6a0aafdcc7-scriptNode-493fe4ad-c90e-4ebc-ac57-636d6323de8a"
                }
            ],
            "viewport": {
                "x": 0,
                "y": 0,
                "zoom": 1
            }
        }
        "#;
        let graph: GraphObject = serde_json::from_str(object).unwrap();
        graph
    }

    pub fn create_dynamic_chain(len: usize) -> GraphObject {
        let mut collection = vec![];
        let mut edges = vec![];

        for i in 0..len {
            let new_node = GraphNode::mock_node(Some(format!("scriptNode-{i}").as_str()), None);

            if i > 0 {
                edges.push(GraphEdge::mock_edge(
                    format!("scriptNode-mockEdge-{i}").as_str(),
                    format!("scriptNode-{}", i - 1usize).as_str(),
                    format!("scriptNode-{}", i).as_str(),
                ));
            }

            collection.push(new_node);
        }

        GraphObject {
            nodes: collection,
            edges: edges,
            viewport: GraphViewport {
                x: 0f32,
                y: 0f32,
                zoom: 0f32,
            },
        }
    }

    impl GraphNode {
        pub fn mock_node(with_id: Option<&str>, with_node_type: Option<&str>) -> Self {
            use serde_json::json;

            use crate::graphs::{GraphMeasurement, GraphPosition};

            Self {
                id: with_id.or_else(|| Some("scriptNode")).unwrap().to_owned(),
                node_type: with_node_type
                    .or_else(|| Some("scriptNode"))
                    .unwrap()
                    .to_owned(),
                position: GraphPosition { x: 0f32, y: 0f32 },
                measurement: GraphMeasurement {
                    width: 0f32,
                    height: 0f32,
                },
                data: json!({}),
            }
        }
    }

    impl GraphEdge {
        pub fn mock_edge(id: &str, source_id: &str, target_id: &str) -> Self {
            Self {
                id: id.to_owned(),
                edge_type: "mockEdge".to_owned(),
                source: source_id.to_owned(),
                target: target_id.to_owned(),
            }
        }
    }

    #[test]
    fn get_connected_nodes_should_have_2() {
        // When
        let graph = create_from_json();

        let nodes = graph.get_connected_nodes("scriptNode-c508eb1b-5b7f-48ce-98ca-5a6a0aafdcc7");

        // Then
        assert_eq!(
            nodes.len(),
            2usize,
            "Should have a connected startNode and a connected scriptNode"
        );
    }

    #[test]
    fn get_connected_source_nodes_should_have_1() {
        // When
        let graph = create_from_json();

        let nodes =
            graph.get_connected_source_nodes("scriptNode-c508eb1b-5b7f-48ce-98ca-5a6a0aafdcc7");

        // Then
        assert_eq!(
            nodes.len(),
            1usize,
            "Should have a connected startNode and a connected scriptNode"
        );
    }

    #[test]
    fn get_connected_target_nodes_should_have_1() {
        // When
        let graph = create_from_json();

        let nodes =
            graph.get_connected_target_nodes("scriptNode-c508eb1b-5b7f-48ce-98ca-5a6a0aafdcc7");

        // Then
        assert_eq!(
            nodes.len(),
            1usize,
            "Should have a connected startNode and a connected scriptNode"
        );
    }

    #[test]
    fn get_connected_target_nodes_should_have_none() {
        // When
        let graph = create_from_json();

        let nodes =
            graph.get_connected_target_nodes("scriptNode-493fe4ad-c90e-4ebc-ac57-636d6323de8a");

        // Then
        assert_eq!(
            nodes.len(),
            0usize,
            "Should not have a connected target node"
        );
    }

    #[test]
    fn get_connected_source_nodes_should_have_none() {
        // When
        let graph = create_from_json();

        let nodes = graph.get_connected_source_nodes("startNode");

        // Then
        assert_eq!(
            nodes.len(),
            0usize,
            "Should not have a connected source node"
        );
    }

    #[test]
    fn create_in_memory_graph_should_have_3_nodes() {
        // When
        let graph = create_from_json();

        let mut memory_graph =
            crate::graphs::in_memory_graph::InMemoryGraph::from_graph_object(graph);

        // Then
        println!("{memory_graph:?}");
        assert_eq!(memory_graph.nodes.len(), 3usize, "Should have 3 nodes");

        memory_graph.dispose();
    }

    #[test]
    fn create_dynamic_chain_test_lookup_time_last_element() {
        use std::time::{Instant, Duration};
    
        let graph = create_dynamic_chain(1_000_000);
        let mut times: Vec<Duration> = Vec::with_capacity(1000);
        let mut last_element_by_name = None;
    
        for _ in 0..1000 {
            let time_now = Instant::now();
            last_element_by_name = std::hint::black_box(graph.find_node("scriptNode-999999"));
            times.push(time_now.elapsed());
        }
    
        let sum: Duration = times.iter().sum();
        let avg = sum / times.len() as u32;
        let max = times.iter().max().unwrap();
        let min = times.iter().min().unwrap();
    
        println!("Results: Avg: {:?}, Min: {:?}, Max: {:?}", avg, min, max);
        
        assert!(last_element_by_name.is_some());
    }

    #[test]
    fn create_dynamic_chain_test_lookup_time_in_memory_graph_last_element() {
        use std::time::{Instant, Duration};
    
        let json_graph = create_dynamic_chain(1_000_000);
        let img = InMemoryGraph::from_graph_object(json_graph);
        let mut times: Vec<Duration> = Vec::with_capacity(100000);
        let mut last_element_by_name = None;
    
        for _ in 0..100000 {
            let time_now = Instant::now();
            last_element_by_name = std::hint::black_box(img.find_node("scriptNode-999999"));
            times.push(time_now.elapsed());
        }
    
        let sum: Duration = times.iter().sum();
        let avg = sum / times.len() as u32;
        let max = times.iter().max().unwrap();
        let min = times.iter().min().unwrap();
    
        println!("Results: Avg: {:?}, Min: {:?}, Max: {:?}", avg, min, max);
        
        assert!(last_element_by_name.is_some());
    }
}
