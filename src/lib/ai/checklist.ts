import fs from "fs";
import path from "path";

const CHECKLIST_PATH = path.join(process.cwd(), "idealoop_seo_200_articles_checklist.md");

export interface Topic {
    number: number;
    title: string;
}

export function getNextTopics(count: number = 5): Topic[] {
    const content = fs.readFileSync(CHECKLIST_PATH, "utf8");
    const lines = content.split("\n");
    const topics: Topic[] = [];

    for (const line of lines) {
        // Match unchecked items: - [ ] 1. Topic Title (flexible whitespace)
        const match = line.match(/^-\s*\[\s*\]\s*(\d+)\.\s*(.+)$/);
        if (match) {
            topics.push({
                number: parseInt(match[1]),
                title: match[2].trim(),
            });
            if (topics.length >= count) break;
        }
    }

    return topics;
}

export function markTopicComplete(topicNumber: number): void {
    const content = fs.readFileSync(CHECKLIST_PATH, "utf8");
    const lines = content.split("\n");

    const updatedLines = lines.map(line => {
        // Match the specific topic number: - [ ] 1. Topic Title (flexible whitespace)
        const regex = new RegExp(`^-\\s*\\[\\s*\\]\\s*${topicNumber}\\.\\s*(.+)$`);
        if (regex.test(line)) {
            return line.replace(/\[\s*\]/, "[x]");
        }
        return line;
    });

    fs.writeFileSync(CHECKLIST_PATH, updatedLines.join("\n"), "utf8");
}
