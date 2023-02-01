import { createReadStream, createWriteStream } from "fs";
import { createInterface } from "readline";

const css = createReadStream("node_modules/lucide-static/font/lucide.css");
const glyphMap = createWriteStream("assets/fonts/Lucide.json", "utf-8");

let map = {};

const rl = createInterface(css);
const regex = /\.icon-(.+):before { content: "\\(.+)"; }/;
rl.on("line", (line) => {
  const match = regex.exec(line);
  if (match) {
    const icon = match[1];
    const index = parseInt(match[2], 16);
    map[icon] = index;
  }
});

rl.on("close", () => {
  glyphMap.write(JSON.stringify(map, undefined, 2) + "\n");
});
