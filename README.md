# Local LLM Model Dashboard

This project is a practical test of whether a local language model can help build a working static dashboard from real public data using a local machine and open-source tooling.

## Project purpose

The goal was to test a realistic workflow in which a local model, run through Claude Code, is used to generate a website from real statistics published by CBS.nl. The project focuses on whether a carefully guided local model can:

- understand the data structure and business context;
- create the actual dashboard layout and interactive behavior;
- keep the code consistent and production-friendly;
- work with real-world spreadsheet and JSON data rather than synthetic examples;
- iterate patiently with detailed instructions until the result is functional.

## Machine and model used

- Hardware: MacBook Pro 2021
- RAM: 32 GB
- Local model: `qwen3-coder:30b`
- Runtime: Ollama local inference
- Workflow tool: Claude Code
- Data source: CBS.nl (official Dutch statistics)

This was a test of local AI-assisted software building, not a cloud-based workflow. The point was to see whether a strong local model could handle the full task when given precise direction and enough iteration time.

## What this project demonstrates

The result shows that a local model can build a usable website when:

- the instructions are explicit and structured;
- the task is broken into small steps;
- the developer is very specific about file structure, content, and behavior;
- the model is given real data and constraints instead of vague requirements;
- the process is iterative and sometimes slow.

In other words, the model was not magically producing a finished product in one pass. It worked because the task was guided carefully, with repeated refinements and a strong focus on correctness.

## Key lesson

A local model can be useful for building software, but it requires:

- detailed prompting;
- patience during errors and debugging;
- careful review of generated output;
- clear boundaries for scope and implementation;
- multiple rounds of improvement instead of expecting a perfect result immediately.

The biggest takeaway is that the model can work well when it is treated like a disciplined junior developer that needs precise instructions, feedback, and a structured process.

## Data source

The dashboard uses real statistical information from CBS.nl. This project was designed as a real-data experiment rather than a demo built from fake or simplified data. The challenge was not just visual design, but making sure the dashboard reflected actual data patterns and could be interpreted correctly.

## Repository structure

- `index.html` - main dashboard page
- `styles.css` - styling and layout
- `scripts.js` - JavaScript logic for client-side behavior
- `dashboards/` - dashboard pages and dashboard-specific scripts
- `data/` - source files, generated data, and automation scripts
- `scripts/` - generation and setup utilities
- `README.md` - project documentation

## Recommended workflow

1. Define the data source and objective clearly.
2. Tell the model exactly what the output should look like.
3. Specify front-end structure, styling expectations, and behavior.
4. Give explicit instructions for file names and folder organization.
5. Provide the real data and explain how it should be processed.
6. Review every generated file carefully.
7. Fix issues in small, specific iterations.
8. Keep prompting detailed and focused instead of broad and vague.
9. Be patient; these tasks often need multiple passes to become correct.

## Practical note

This project was intentionally built as a local AI-assisted prototype. It does not claim that a local model replaces expert engineering judgment. Instead, it demonstrates that with enough care and iteration, a local model can contribute meaningfully to building a functioning static webpage from realistic data.

## GitHub

This repository was pushed to GitHub and is meant to serve as a record of the experiment and the resulting output.

## Summary

This was a successful local-model test under realistic conditions: a MacBook Pro 2021 with 32 GB RAM, Ollama running `qwen3-coder:30b`, and real CBS.nl data. The experiment showed that careful instruction, deliberate iteration, and patience can make a local model effective for building a working dashboard from real-world information.