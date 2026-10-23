1. Unit Tests

Test individual components in isolation:
* Algorithm correctness for valid inputs and edge cases.
* Execution-trace generation and state transitions.
* Forward/backward navigation, reset, and playback controls.
* Input validation and error handling.
* Time and space complexity metadata where applicable.

2. Integration Tests

Test how components work together:
* Algorithm execution produces correct visualization states.
* Execution steps synchronize with pseudocode highlighting.
* Custom inputs flow correctly through the engine to the renderer.
* Playback controls update the visualization consistently.

3. End-to-End Tests

Test critical user journeys:
* Navigate to an algorithm and run its visualization.
* Enter custom input and inspect execution steps.
* Play, pause, move backward, and reset an execution.
* Open learning content and navigate to a related practice problem.
* Verify core features work on desktop and mobile layouts.

4. Definition of Done

A task is complete when:
* The implementation meets its acceptance criteria.
* Relevant tests pass.
* Edge cases and invalid inputs are handled.
* Linting and production builds succeed.
* The UI is responsive and consistent with the design.
* Documentation is updated when necessary.
* No known critical bugs remain.