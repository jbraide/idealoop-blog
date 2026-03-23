import fs from "fs";
import path from "path";

const CHECKLIST_PATH = path.join(process.cwd(), "idealoop_seo_200_articles_checklist.md");

function getNextTopics(count: number = 5) {
    try {
        const content = fs.readFileSync(CHECKLIST_PATH, "utf8");
        const lines = content.split("\n");
        const topics = [];

        console.log(`Total lines: ${lines.length}`);

        for (const line of lines) {
            // Log suspicious lines
            if (line.includes("1.") && line.includes("[")) {
                console.log(`Checking line: "${line}"`);
            }

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
    } catch (err) {
        console.error(err);
        return [];
    }
}

const topics = getNextTopics(1);
console.log("Found topics:", JSON.stringify(topics, null, 2));
