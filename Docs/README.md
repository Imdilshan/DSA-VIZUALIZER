# AlgoVisualizer

**Making Data Structures and Algorithms easier to understand, one step at a time.**

AlgoVisualizer is a project I'm building to explore a better way of learning Data Structures and Algorithms (DSA) through interactive visualizations, step-by-step execution, and practical problem-solving.

Understanding an algorithm involves more than reading its code or memorizing its complexity. It also means understanding how its state changes, why certain decisions are made, and how individual operations contribute to the final result.

AlgoVisualizer aims to make that process more intuitive by allowing learners to see algorithms in action, experiment with different inputs, and connect their execution to the underlying code.

The project is being developed incrementally alongside my own DSA learning journey, with the long-term goal of covering a broad range of topics and working toward Striver's A2Z DSA Sheet.

## The Idea

The platform is built around three connected experiences:

- **Learn** — Explore DSA concepts through structured explanations, examples, and a progressive learning path.
- **Visualize** — Interact with algorithms through step-by-step execution, custom inputs, playback controls, and synchronized code.
- **Practice** — Connect concepts with DSA problems, solution walkthroughs, and complexity analysis.

The goal is to bring these experiences together in one place, helping learners move from understanding a concept to seeing how it works and applying it to problems.

## What I'm Building

The initial focus is on getting the fundamentals right:

- Visualizing basic array operations such as insertion, deletion, and traversal.
- Understanding linear search and binary search through interactive execution.
- Exploring sorting algorithms through their intermediate states.
- Stepping through execution and inspecting changes to variables and data structures.
- Connecting visual states with pseudocode and source code.
- Explaining time and space complexity alongside algorithm behavior.

As the underlying visualization engine develops, the platform will gradually expand to cover more data structures and algorithms, including linked lists, trees, graphs, recursion, greedy algorithms, and dynamic programming.

These are long-term goals, not a claim that every topic is already implemented.

## Design Principles

A few principles guide the project:

- **Understand before memorizing.** Make algorithm behavior easier to reason about rather than simply presenting the final answer.
- **Learn by experimenting.** Let users change inputs and observe how execution changes.
- **Connect code with behavior.** Keep the relationship between implementation and visualization clear.
- **Build incrementally.** Prioritize correctness and a reliable learning experience over the number of supported algorithms.
- **Keep learning accessible.** The platform is intended to remain free and usable without login or registration.
- **Prefer reusable foundations.** Build a visualization engine that can support new algorithms without requiring an entirely new implementation for each one.

## Technology Stack

The initial technical direction includes:

- **React** — Building the user interface.
- **TypeScript** — Improving type safety and maintainability.
- **Vite** — Providing the frontend development and build environment.
- **Vitest** — Testing algorithm logic and execution behavior.
- **Playwright** — Testing important user journeys in the browser.

The stack may evolve as the project develops. Technology choices will be guided by the needs of the application rather than by adding complexity unnecessarily.

## Development Approach

AlgoVisualizer is being developed as a personal, open-access educational project.

The work is organized into incremental stages:

1. Establish the application structure and design system.
2. Build a reusable algorithm visualization engine.
3. Implement and test fundamental algorithms.
4. Develop the guided learning experience.
5. Connect visualizations with relevant practice problems.
6. Expand coverage toward more advanced DSA topics.

Correctness, usability, and maintainability will take priority over implementing everything at once.

## Current Status

**Status: In active development.**

The project is being built incrementally, beginning with the foundations needed for interactive algorithm visualization.

Features and supported topics will be documented as they become available. The long-term vision is broader than the initial release, and the implementation will grow through successive iterations.

## Running Locally

Once the project has been initialized with its dependencies, the expected development workflow will be:

```bash
# Clone the repository
git clone https://github.com/Imdilshan/DSA-VIZUALIZER

# Enter the project directory
cd DSA-VIZUALIZER

# Install dependencies
npm install

# Start the development server
npm run dev