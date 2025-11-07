import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, "dist/backend");

function addJsExtensions(dir) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      addJsExtensions(filePath);
    } else if (file.endsWith(".js")) {
      let content = fs.readFileSync(filePath, "utf-8");
      const originalContent = content;

      // Regex mais permissivo: encontra imports relativos sem .js
      content = content.replace(
        /from\s+['"](\.[^'"]+)(?<!\.js)['"](?=\s*[;,\n])/g,
        'from "$1.js"',
      );

      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, "utf-8");
        console.log(`✓ Fixed: ${filePath}`);
      } else {
        console.log(`⊘ No changes: ${filePath}`);
      }
    }
  });
}

if (fs.existsSync(distDir)) {
  addJsExtensions(distDir);
  console.log("✓ All imports processed!");
} else {
  console.error(`Directory not found: ${distDir}`);
  process.exit(1);
}
