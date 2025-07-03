# Contributing to Jira Bulk Parent Updater

We welcome contributions to the Jira Bulk Parent Updater! By contributing, you help us improve the tool for everyone.

## How to Contribute

### Reporting Bugs
If you find a bug, please open an issue on our GitHub repository. When reporting a bug, please include:
- A clear and concise description of the bug.
- Steps to reproduce the behavior.
- Expected behavior.
- Screenshots or error messages if applicable.
- Your operating system and Node.js/Bun version.

### Suggesting Enhancements
We are always open to new ideas and improvements! To suggest an enhancement:
- Open an issue on our GitHub repository.
- Describe your suggestion clearly and concisely.
- Explain why this enhancement would be valuable.

### Submitting Pull Requests
If you'd like to contribute code, please follow these steps:

1.  **Fork the repository** and clone it to your local machine.
2.  **Create a new branch** for your feature or bug fix:
    ```bash
    git checkout -b feature/your-feature-name
    # or
    git checkout -b bugfix/issue-description
    ```
3.  **Install dependencies** (if you haven't already):
    ```bash
    bun install
    ```
4.  **Make your changes** and test them thoroughly.
5.  **Commit your changes** with a clear and descriptive commit message.
6.  **Push your branch** to your forked repository.
7.  **Open a Pull Request** to the `main` branch of the original repository.

#### Pull Request Guidelines:
- Ensure your code adheres to the project's coding style.
- Provide a clear and concise description of your changes.
- Reference any related issues in your pull request description (e.g., `Fixes #123`).
- Be prepared to address feedback and make further changes during the review process.

## Development Setup

To run the project locally for development:

1.  Clone the repository:
    ```bash
    git clone https://github.com/Max-Levitskiy/jira-bulk-parent-updater.git
    cd jira-bulk-parent-updater
    ```
2.  Install dependencies:
    ```bash
    bun install
    ```
3.  Run the tool:
    ```bash
    bun src/index.ts [options]
    ``` 