# Flow-RT

Flow-RT is a high-performance desktop application that bridges the gap between low-code accessibility and Rust’s computational power. Built with Tauri, React, and Rust, it allows users to design complex logic visually and execute it via a blazingly fast, memory-safe runtime.



---

## The Core Concept

Modern development often forces a choice: the velocity of low-code tools (which often hit performance ceilings) or the performance of systems languages (which have steep learning curves). 

Flow-RT removes that compromise. By utilizing the Tauri framework, the project offloads heavy computation and graph traversal to a native Rust core, while providing a fluid, modern interface built in React.

* **Frontend:** A sleek React-based flowgraph editor for designing logic.
* **Backend:** A native Rust powerhouse that manages state, executes nodes, and handles high-speed data processing via Tauri's IPC bridge.

---

## Key Features

* **Native Performance:** Runs as a lightweight desktop app with a minimal memory footprint thanks to Tauri.
* **Visual Logic Builder:** Drag-and-drop nodes to define data flow, state transitions, and logic gates.
* **Rust-Powered Runtime:** Minimal overhead execution leveraging Rust’s zero-cost abstractions.
* **Hot-Reloading Graphs:** Modify your visual graph and see the native execution update in real-time.
* **Type-Safe Flow:** Strict type-checking between node connections to prevent runtime crashes.

---

## Architecture

Flow-RT leverages the Tauri Architecture to isolate the UI from the execution engine:

| Layer | Responsibility | Technology |
| :--- | :--- | :--- |
| **The Designer** | User interface, graph rendering, and JSON serialization. | React / React Flow |
| **The Bridge** | Type-safe communication between UI and the OS. | Tauri (Commands & Events) |
| **The Engine** | Graph execution, node registry, and thread management. | Rust (Tokio/Rayon) |



---

## Getting Started

### Prerequisites
* Node.js (v18+)
* Rust/Cargo (Stable)
* WebView2 (Windows) or relevant Linux dependencies

### Installation

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/Stijnn/flow-rt.git](https://github.com/Stijnn/flow-rt.git)
    cd flow-rt
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Run in Development Mode**
    ```bash
    npm run tauri dev
    ```

4.  **Building a release**
    ```bash
    npm run tauri build
    ```

---

## Roadmap

- [ ] **Milestone 1:** Basic node execution (Math, Logic, Strings).
- [ ] **Milestone 2:** Support for asynchronous nodes using `tokio`.
- [ ] **Milestone 3:** Custom "Sub-graphs" (Grouping nodes into a single node).
- [ ] **Milestone 4:** Lua Scripting nodes, allowing complex and custom implementations.
- [ ] **Milestone 5:** Headless VM written in C++ or Rust for executing the workflow.

---

## Contributing

We welcome contributions! Whether it's adding new nodes to the library, optimizing the Rust execution engine, or improving the React UI, please feel free to open an issue or submit a pull request.

---

## License

Distributed under the Apache License 2.0. See `LICENSE` for more information.

Copyright © 2026 Stijnn