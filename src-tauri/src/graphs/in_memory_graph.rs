use std::{cell::RefCell, rc::Rc};

use rustc_hash::FxHashMap;

use crate::graphs::{GraphNode, GraphObject};

#[derive(Clone)]
pub struct InMemoryNode {
    pub node_data: GraphNode,
    pub source_connections: InMemoryNodeRefs,
    pub target_connections: InMemoryNodeRefs
}

type InMemoryNodeRef = Rc<RefCell<InMemoryNode>>;
type InMemoryNodeRefs = Vec<InMemoryNodeRef>;

#[derive(Clone, Debug)]
pub struct InMemoryGraph {
    pub nodes: InMemoryNodeRefs,
    pub nodes_by_type: FxHashMap<String, InMemoryNodeRefs>,
    pub nodes_by_id: FxHashMap<String, InMemoryNodeRef>
}

impl InMemoryNode {
    pub fn from_graph_node(graph_node: &GraphNode) -> Self {
        Self {
            node_data: graph_node.clone(),
            source_connections: vec![],
            target_connections: vec![],
        }
    }
}

impl core::fmt::Debug for InMemoryNode {
    fn fmt(&self, f: &mut core::fmt::Formatter<'_>) -> core::fmt::Result {
        f.debug_struct("InMemoryNode")
            .field("id", &self.node_data.id)
            .field("type", &self.node_data.node_type)
            .field("source_connections_count", &self.source_connections.len())
            .field("target_connections_count", &self.target_connections.len())
            .finish()
    }
}

impl InMemoryGraph {
    pub fn from_graph_object(graph_object: GraphObject) -> Self {
        let mut ref_nodes: InMemoryNodeRefs = vec![];
        let mut ref_nodes_by_type = FxHashMap::<String, InMemoryNodeRefs>::default();
        let mut ref_nodes_by_id = FxHashMap::<String, InMemoryNodeRef>::default();
        
        graph_object.nodes.iter().for_each(|node| {
            let imn = Rc::new(RefCell::new(InMemoryNode::from_graph_node(node)));
            ref_nodes.push(Rc::clone(&imn));
            if let Some(_) = ref_nodes_by_id.insert(node.id.clone(), Rc::clone(&imn)) {
                panic!("Should not have duplicate IDs. Duplicate found: {}", node.id);
            }
            ref_nodes_by_type
                .entry(node.node_type.clone())
                .or_insert_with(Vec::new)
                .push(Rc::clone(&imn));
        });

        graph_object.edges.iter().for_each(|edge| {
            let source_node = ref_nodes_by_id.get(&edge.source);
            let target_node = ref_nodes_by_id.get(&edge.target);
        
            if let (Some(s), Some(t)) = (source_node, target_node) {
                s.borrow_mut().target_connections.push(Rc::clone(t));
                t.borrow_mut().source_connections.push(Rc::clone(s));
            }
        });

        Self { nodes: ref_nodes, nodes_by_type: ref_nodes_by_type, nodes_by_id: ref_nodes_by_id }
    }

    pub fn find_node(&self, id: &str) -> Option<&InMemoryNodeRef> {
        self.nodes_by_id.get(id)
    }

    pub fn find_by_type(&self, node_type: &str) -> Option<&InMemoryNodeRefs> {
        self.nodes_by_type.get(node_type)
    }
}

impl InMemoryGraph {
    pub fn dispose(&mut self) {
        for node in &self.nodes {
            let mut node_mut = node.borrow_mut();
            node_mut.source_connections.clear();
            node_mut.target_connections.clear();
        }
        self.nodes_by_id.clear();
        self.nodes_by_type.clear();
        self.nodes.clear();
    }
}