/**
 * Validates that the website data stays in sync with the plugin source.
 *
 * Checks:
 * 1. Rule count in rules.ts matches actual rules in src/rules/*.js
 * 2. Every rule name in src/index.js exists in rules.ts
 * 3. Version in config.ts matches package.json
 * 4. CHANGELOG.md exists and is readable
 * 5. Rule doc files in docs/rules/ exist for every category
 *
 * Run: node scripts/validate-sync.js
 * Runs automatically before build via "prebuild" script.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../../.."); // repo root
const websiteRoot = path.resolve(__dirname, "..");

let errors = 0;

const fail = (msg) => {
    console.error(`  \u274C ${msg}`);
    errors++;
};

const pass = (msg) => {
    console.log(`  \u2713 ${msg}`);
};

// Skip on Vercel — validation is for local/CI, not deployment builds
if (process.env.VERCEL) {
    console.log("\n\u2713 Skipping sync validation on Vercel deployment.\n");
    process.exit(0);
}

console.log("\nValidating website sync with plugin source...\n");

// 1. Version sync: package.json vs config.ts
const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf-8"));
const configTs = fs.readFileSync(path.join(websiteRoot, "src/data/config.ts"), "utf-8");
const configVersionMatch = configTs.match(/version:\s*"([^"]+)"/);

if (configVersionMatch && configVersionMatch[1] === packageJson.version) {
    pass(`Version sync: ${packageJson.version}`);
} else {
    fail(`Version mismatch: package.json=${packageJson.version}, config.ts=${configVersionMatch?.[1] || "not found"}`);
}

// 2. Rule count: count rules in src/index.js exports (format: "rule-name": ruleVariable)
const indexJs = fs.readFileSync(path.join(root, "src/index.js"), "utf-8");
const rulesSection = indexJs.slice(indexJs.indexOf("rules: {"));
const ruleExportMatches = rulesSection.match(/"[\w-]+"\s*:/g);
const sourceRuleCount = ruleExportMatches ? ruleExportMatches.length : 0;

// Count rules in rules.ts — match rule names that contain hyphens (rule names always have hyphens, option names don't)
const rulesTs = fs.readFileSync(path.join(websiteRoot, "src/data/rules.ts"), "utf-8");
const websiteRuleMatches = rulesTs.match(/name:\s*"[\w]+-[\w-]+"/g);
const websiteRuleCount = websiteRuleMatches ? websiteRuleMatches.length : 0;

if (sourceRuleCount === websiteRuleCount) {
    pass(`Rule count sync: ${sourceRuleCount} rules`);
} else {
    fail(`Rule count mismatch: src/index.js=${sourceRuleCount}, rules.ts=${websiteRuleCount}`);
}

// 3. Every rule in src/index.js exists in rules.ts
if (ruleExportMatches) {
    const sourceRuleNames = ruleExportMatches.map((r) => r.replace(/[":\s]/g, ""));
    const websiteRuleNames = websiteRuleMatches
        ? websiteRuleMatches.map((r) => r.replace(/name:\s*"/, "").replace(/"/, ""))
        : [];
    const missingInWebsite = sourceRuleNames.filter((r) => !websiteRuleNames.includes(r));
    const extraInWebsite = websiteRuleNames.filter((r) => !sourceRuleNames.includes(r));

    if (missingInWebsite.length === 0) {
        pass("All source rules present in website");
    } else {
        fail(`Rules missing from website: ${missingInWebsite.join(", ")}`);
    }

    if (extraInWebsite.length === 0) {
        pass("No extra rules in website");
    } else {
        fail(`Extra rules in website not in source: ${extraInWebsite.join(", ")}`);
    }
}

// 4. CHANGELOG.md exists and is readable
const changelogPath = path.join(root, "CHANGELOG.md");

if (fs.existsSync(changelogPath)) {
    const changelog = fs.readFileSync(changelogPath, "utf-8");
    const versionEntries = changelog.match(/^## \[\d+\.\d+\.\d+\]/gm);

    if (versionEntries && versionEntries.length > 0) {
        pass(`CHANGELOG.md readable: ${versionEntries.length} version entries`);
    } else {
        fail("CHANGELOG.md exists but has no version entries");
    }
} else {
    fail("CHANGELOG.md not found at repo root");
}

// 5. Rule doc files exist for every category
const categories = [...rulesTs.matchAll(/slug:\s*"([\w-]+)"/g)].map((m) => m[1]);
const docsDir = path.join(root, "docs/rules");
const missingDocs = categories.filter((cat) => !fs.existsSync(path.join(docsDir, `${cat}.md`)));

if (missingDocs.length === 0) {
    pass(`All ${categories.length} category doc files exist`);
} else {
    fail(`Missing rule doc files: ${missingDocs.map((d) => `${d}.md`).join(", ")}`);
}

// 6. Navigation has all categories
const navTs = fs.readFileSync(path.join(websiteRoot, "src/data/navigation.ts"), "utf-8");
const navCategories = [...navTs.matchAll(/href:\s*"\/docs\/rules\/([\w-]+)"/g)].map((m) => m[1]);
const missingNav = categories.filter((cat) => !navCategories.includes(cat));

if (missingNav.length === 0) {
    pass("Navigation includes all categories");
} else {
    fail(`Categories missing from navigation: ${missingNav.join(", ")}`);
}

// Summary
console.log("");

if (errors > 0) {
    console.error(`\u274C Sync validation failed with ${errors} error(s). Fix the issues above before building.`);
    process.exit(1);
} else {
    console.log("\u2713 All sync checks passed.\n");
}
