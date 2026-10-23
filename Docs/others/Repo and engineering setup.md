1. Repository and Documentation

* Maintain a clear README explaining the project, features, technology stack, and local setup.
* Document the architecture and visualization engine design.
* Maintain a .gitignore for dependencies, build outputs, and environment files.

2. Git Workflow

* Use main as the stable branch.
* Use short-lived feature branches for significant changes.
* Follow conventional commit messages, such as feat: add binary search visualization and fix: handle empty arrays.

3. Code Quality

* Use TypeScript for type safety.
* Configure ESLint for linting and Prettier for consistent formatting.
* Establish consistent naming conventions and modular folder structures.

4. Testing and CI

* Write unit tests for algorithm logic and execution traces.
* Test visualization controls and important user interactions.
* Use GitHub Actions to run linting, tests, and production builds on pushes and pull requests.

5. Environment and Deployment

* Keep configuration minimal and avoid committing secrets.
* Use environment variables only when required.
* Deploy the frontend using a suitable static hosting service.
* Skip Docker initially unless the project develops environment or deployment requirements that justify it.

6. Code Organization

Separate the codebase into clear modules:

* algorithms/ — Algorithm implementations.
* engine/ — Execution traces and state management.
* visualizers/ — Data structure rendering components.
* components/ — Reusable UI components.
* content/ — Topics, explanations, pseudocode, and problems.
* tests/ — Algorithm and engine tests.

7. Error Handling

* Validate custom inputs.
* Display clear, user-friendly error messages.
* Handle unsupported inputs and edge cases without crashing the application.
* Avoid adding complex logging or monitoring infrastructure until it becomes necessary.