Recommended ADRs

ADR-001: Frontend Architecture

* Decide between React + Vite and Next.js.
* Document the trade-offs based on interactivity, performance, and project complexity.

ADR-002: Visualization Engine Design

* Use a reusable, trace-based visualization engine instead of implementing independent animations for every algorithm.
* Separate algorithm execution, state transitions, and rendering.

ADR-003: Technology Stack

* Choose TypeScript, styling tools, animation libraries, and testing frameworks.
* Document why the selected tools fit the project.

ADR-004: Content Storage

* Start with structured local files for topics, algorithms, pseudocode, explanations, and examples.
* Introduce a database only if future requirements justify it.

ADR-005: Algorithm Execution Model

* Initially generate deterministic execution traces from predefined algorithm implementations.
* Defer arbitrary user-code execution until a later phase.

ADR-006: No Authentication or Backend Initially

* Keep all learning features publicly accessible without accounts.
* Prefer a client-side architecture while the application does not require server-side functionality.

When to Create an ADR

Create an ADR when a decision:

* Is difficult or expensive to reverse.
* Affects multiple parts of the architecture.
* Has meaningful trade-offs between alternatives.
* Is likely to be reconsidered during future development.

Use a simple format: Context → Decision → Alternatives Considered → Consequences.