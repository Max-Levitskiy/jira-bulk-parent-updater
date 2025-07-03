#!/usr/bin/env bun

import { parseArgs } from "util";
import { readFileSync, existsSync } from "fs";

interface JiraIssue {
  key: string;
  id: string;
  currentParent?: string;
  currentParentKey?: string;
}

interface CliArgs {
  csvFile: string;
  parentKey: string;
  pat: string;
  jiraUrl: string;
  email: string;
  issues?: string[];
  dryRun: boolean;
  help: boolean;
}

const USAGE = `
Jira Parent Setter

Usage: bun jira-parent-setter.ts [options]

Options:
  --csv-file <path>        Path to the Jira export CSV file (required)
  --parent-key <key>       Parent issue key to assign (e.g., PROJ-123) (required)
  --pat <token>            Jira Personal Access Token (required)
  --jira-url <url>         Jira instance URL (e.g., https://your-domain.atlassian.net) (required)
  --email <email>          Jira user email (required)
  --issues <keys>          Comma-separated list of issue keys to process (optional)
  --dry-run               Show what would be done without making changes (default: false)
  --help                  Show this help message

Examples:
  # Set parent for all issues in CSV
  bun jira-parent-setter.ts --csv-file export.csv --parent-key PROJ-123 --pat your-token --jira-url https://your-domain.atlassian.net --email your-email

  # Dry run for specific issues
  bun jira-parent-setter.ts --csv-file export.csv --parent-key PROJ-123 --pat your-token --jira-url https://your-domain.atlassian.net --email your-email --issues US-1,US-2,US-3 --dry-run

  # Set parent for specific issues only
  bun jira-parent-setter.ts --csv-file export.csv --parent-key PROJ-123 --pat your-token --jira-url https://your-domain.atlassian.net --email your-email --issues US-1,US-2
`;

function parseCliArgs(): CliArgs {
  const { values } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      "csv-file": { type: "string" },
      "parent-key": { type: "string" },
      "pat": { type: "string" },
      "jira-url": { type: "string" },
      "email": { type: "string" },
      "issues": { type: "string" },
      "dry-run": { type: "boolean", default: false },
      "help": { type: "boolean", default: false }
    },
    allowPositionals: false
  });

  return {
    csvFile: values["csv-file"] || "",
    parentKey: values["parent-key"] || "",
    pat: values["pat"] || "",
    jiraUrl: values["jira-url"] || "",
    email: values["email"] || "",
    issues: values["issues"] ? values["issues"].split(",").map(s => s.trim()) : undefined,
    dryRun: values["dry-run"] || false,
    help: values["help"] || false
  };
}

function validateArgs(args: CliArgs): void {
  if (args.help) {
    console.log(USAGE);
    process.exit(0);
  }

  const required = ["csvFile", "parentKey", "pat", "jiraUrl", "email"];
  const missing = required.filter(key => !args[key as keyof CliArgs]);
  
  if (missing.length > 0) {
    console.error(`❌ Missing required arguments: ${missing.join(", ")}`);
    console.log(USAGE);
    process.exit(1);
  }

  if (!existsSync(args.csvFile)) {
    console.error(`❌ CSV file not found: ${args.csvFile}`);
    process.exit(1);
  }

  // Validate Jira URL format
  try {
    new URL(args.jiraUrl);
  } catch {
    console.error(`❌ Invalid Jira URL format: ${args.jiraUrl}`);
    process.exit(1);
  }

  // Validate parent key format (basic check)
  if (!/^[A-Z]+-\d+$/.test(args.parentKey)) {
    console.error(`❌ Invalid parent key format: ${args.parentKey}. Expected format: PROJ-123`);
    process.exit(1);
  }
}

function parseCsv(csvFile: string): JiraIssue[] {
  const content = readFileSync(csvFile, "utf-8");
  const lines = content.split("\n").filter(line => line.trim());
  
  if (lines.length < 2) {
    throw new Error("CSV file must contain at least a header and one data row");
  }

  const headers = lines[0].split(",");
  const keyIndex = headers.findIndex(h => h.trim() === "Issue key");
  const idIndex = headers.findIndex(h => h.trim() === "Issue id");
  const parentIndex = headers.findIndex(h => h.trim() === "Parent");
  const parentKeyIndex = headers.findIndex(h => h.trim() === "Parent key");

  if (keyIndex === -1 || idIndex === -1) {
    throw new Error("CSV must contain 'Issue key' and 'Issue id' columns");
  }

  const issues: JiraIssue[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(",");
    
    if (row.length <= Math.max(keyIndex, idIndex)) {
      console.warn(`⚠️  Skipping malformed row ${i + 1}`);
      continue;
    }

    const key = row[keyIndex]?.trim();
    const id = row[idIndex]?.trim();
    
    if (!key || !id) {
      console.warn(`⚠️  Skipping row ${i + 1} - missing key or id`);
      continue;
    }

    issues.push({
      key,
      id,
      currentParent: parentIndex !== -1 ? row[parentIndex]?.trim() : undefined,
      currentParentKey: parentKeyIndex !== -1 ? row[parentKeyIndex]?.trim() : undefined
    });
  }

  return issues;
}

async function getJiraIssue(jiraUrl: string, pat: string, issueKey: string, email: string): Promise<any> {
  const auth = Buffer.from(`${email}:${pat}`).toString('base64');
  const response = await fetch(`${jiraUrl}/rest/api/3/issue/${issueKey}`, {
    headers: {
      "Authorization": `Basic ${auth}`,
      "Accept": "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch issue ${issueKey}: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function setParent(jiraUrl: string, pat: string, issueKey: string, parentKey: string, email: string): Promise<void> {
  const auth = Buffer.from(`${email}:${pat}`).toString('base64');
  const response = await fetch(`${jiraUrl}/rest/api/3/issue/${issueKey}`, {
    method: "PUT",
    headers: {
      "Authorization": `Basic ${auth}`,
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      fields: {
        parent: {
          key: parentKey
        }
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update issue ${issueKey}: ${response.status} ${response.statusText} - ${errorText}`);
  }
}

async function main() {
  const args = parseCliArgs();
  validateArgs(args);

  console.log("🚀 Jira Parent Setter");
  console.log("=====================");
  console.log(`📁 CSV File: ${args.csvFile}`);
  console.log(`🎯 Parent Key: ${args.parentKey}`);
  console.log(`🌐 Jira URL: ${args.jiraUrl}`);
  console.log(`📧 Email: ${args.email}`);
  console.log(`🔄 Mode: ${args.dryRun ? "DRY RUN" : "LIVE"}`);
  
  if (args.issues) {
    console.log(`📋 Target Issues: ${args.issues.join(", ")}`);
  } else {
    console.log("📋 Target Issues: All issues from CSV");
  }
  console.log();

  try {
    // Parse CSV
    console.log("📖 Parsing CSV file...");
    const allIssues = parseCsv(args.csvFile);
    console.log(`Found ${allIssues.length} issues in CSV`);

    // Filter issues if specific ones are requested
    const targetIssues = args.issues 
      ? allIssues.filter(issue => args.issues!.includes(issue.key))
      : allIssues;

    if (targetIssues.length === 0) {
      console.log("❌ No issues to process");
      process.exit(1);
    }

    console.log(`🎯 Processing ${targetIssues.length} issues\n`);

    // Verify parent issue exists
    console.log(`🔍 Verifying parent issue ${args.parentKey}...`);
    try {
      await getJiraIssue(args.jiraUrl, args.pat, args.parentKey, args.email);
      console.log("✅ Parent issue verified\n");
    } catch (error) {
      console.error(`❌ Parent issue verification failed: ${error}`);
      process.exit(1);
    }

    // Process each issue
    let processed = 0;
    let skipped = 0;
    let errors = 0;

    for (const issue of targetIssues) {
      try {
        console.log(`\n🔄 Processing ${issue.key}...`);
        
        // Check if already has the same parent
        if (issue.currentParentKey === args.parentKey) {
          console.log(`⏭️  ${issue.key} already has parent ${args.parentKey}, skipping`);
          skipped++;
          continue;
        }

        if (issue.currentParentKey) {
          console.log(`📋 Current parent: ${issue.currentParentKey}`);
        }

        if (args.dryRun) {
          console.log(`🔍 [DRY RUN] Would set parent of ${issue.key} to ${args.parentKey}`);
        } else {
          await setParent(args.jiraUrl, args.pat, issue.key, args.parentKey, args.email);
          console.log(`✅ Successfully set parent of ${issue.key} to ${args.parentKey}`);
        }
        
        processed++;
      } catch (error) {
        console.error(`❌ Failed to process ${issue.key}: ${error}`);
        errors++;
      }
    }

    // Summary
    console.log("\n📊 Summary");
    console.log("===========");
    console.log(`✅ Processed: ${processed}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    console.log(`❌ Errors: ${errors}`);
    console.log(`📋 Total: ${targetIssues.length}`);

    if (args.dryRun) {
      console.log("\n🔍 This was a dry run. No changes were made.");
      console.log("Remove --dry-run flag to apply changes.");
    }

  } catch (error) {
    console.error(`❌ Fatal error: ${error}`);
    process.exit(1);
  }
}

// Run the script
main().catch(console.error);