# Jira Bulk Parent Updater

![GitHub last commit](https://img.shields.io/github/last-commit/Max-Levitskiy/jira-bulk-parent-updater) ![GitHub issues](https://img.shields.io/github/issues/Max-Levitskiy/jira-bulk-parent-updater) ![GitHub forks](https://img.shields.io/github/forks/Max-Levitskiy/jira-bulk-parent-updater) ![GitHub stars](https://img.shields.io/github/stars/Max-Levitskiy/jira-bulk-parent-updater)

## Description
This tool allows you to update the parent issues of Jira tickets in **bulk** by providing a CSV file. It is particularly useful for migrating issues, restructuring your Jira hierarchy, or performing large-scale updates effortlessly.

## Features
- **Bulk Update**: Efficiently update parent issues for multiple Jira tickets using a single CSV file.
- **Dry Run Mode**: Safely preview changes before applying them to avoid unintended modifications.
- **Cross-Platform**: Available as pre-built binaries for macOS, Linux, and Windows, or runnable from source with Bun.
- **Easy Configuration**: Connects to your Jira instance using host, email, and Personal Access Token (PAT).
- **CSV Driven**: Simple CSV format for defining issue keys and their new parent issues.

## Installation

### Pre-built Binaries
You can download the pre-built binaries for your operating system from the `bin/` directory in this repository:
- `jira-parent-updater-mac` (for macOS)
- `jira-parent-updater-linux` (for Linux)
- `jira-parent-updater-win.exe` (for Windows)

### From Source
To run the tool from source, you need [Bun](https://bun.sh/) installed. Bun is a fast all-in-one JavaScript runtime.

1. Clone the repository:
   ```bash
   git clone https://github.com/Max-Levitskiy/jira-bulk-parent-updater.git
   cd jira-bulk-parent-updater
   ```
2. Install dependencies:
   ```bash
   bun install
   ```
3. You can then run the tool using `bun`:
   ```bash
   bun src/index.ts [options]
   ```

## Usage

```bash
./jira-parent-updater-mac --host <your-jira-host> --email <your-jira-email> --token <your-jira-pat-token> --file <path-to-your-csv> --no-dry-run
```

Or if running from source:
```bash
bun src/index.ts --host <your-jira-host> --email <your-jira-email> --token <your-jira-pat-token> --file <path-to-your-csv> --no-dry-run
```

### Options:
- `--host <url>`: Your Jira instance URL (e.g., `https://yourcompany.atlassian.net`).
- `--email <email>`: Your Jira registered email address.
- `--token <PAT>`: Your Jira Personal Access Token. See [How to create a PAT token](#how-to-create-a-pat-token).
- `--file <path>`: Path to your CSV file. See [CSV Format](#csv-format) and [How to export CSV from Jira](#how-to-export-csv-from-jira).
- `--no-dry-run`: (Optional) By default, the tool runs in dry-run mode, meaning it will only show what changes *would* be made without actually making them. Use this flag to perform the actual updates.

## CSV Format
The CSV file must contain at least two columns: `Issue Key` and `Parent`.

| Issue Key | Parent    |
|-----------|-----------|
| PROJ-123  | PROJ-100  |
| PROJ-456  | PROJ-789  |

- `Issue Key`: The key of the Jira issue you want to update (e.g., `PROJ-123`).
- `Parent`: The key of the issue that will become the new parent (e.g., `PROJ-100`).

## How to Export CSV from Jira

1. Navigate to your Jira instance.
2. Go to **Issues** in the top navigation bar.
3. Use JQL (Jira Query Language) to filter for the issues you need. For example, to get all issues in a project:
   `project = "Your Project Name"`
4. Once your issues are displayed, click on the **Export** button (usually a small icon that looks like a sheet or gear) and select **Export Excel CSV**.
5. Open the downloaded CSV file and ensure it contains the `Issue Key` and `Parent` columns. If not, you may need to add them manually or adjust your Jira export settings.

For more detailed instructions, refer to the official Jira documentation on [Exporting search results to Microsoft Excel](https://support.atlassian.com/jira-software-cloud/docs/exporting-search-results-to-microsoft-excel/).

## How to Create a PAT Token

1. Log in to your Jira Cloud site.
2. Click on your profile avatar in the top right corner and select **Profile**.
3. In your profile settings, navigate to **Personal Access Tokens**.
4. Click **Create token**.
5. Give your token a memorable name and set an expiry date (optional but recommended for security).
6. Make sure to copy the token immediately after creation, as it will not be shown again.

For more detailed instructions, refer to the official Jira documentation on [Manage API tokens for your Atlassian account](https://id.atlassian.com/manage-profile/security/api-tokens). 