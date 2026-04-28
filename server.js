const express = require("express");
const fs = require("fs");
const path = require("path");
const { startPlayer, skipCurrent } = require("./player");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("public"));

const QUEUE_FILE = path.join(__dirname, "queue.json");

function loadQueue() {
  if (!fs.existsSync(QUEUE_FILE)) return [];
  return JSON.parse(fs.readFileSync(QUEUE_FILE));
}

function saveQueue(queue) {
  fs.writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2));
}

// In-memory queue (source of truth during runtime)
let queue = loadQueue();

// ---- API ----

// Get queue
app.get("/api/queue", (req, res) => {
  res.json(queue);
});

// Add video
app.post("/api/queue", (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "Missing URL" });

  //parse url to get video id
  const urlObj = new URL(url);
  const videoId = urlObj.searchParams.get("v");
  if (!videoId) return res.status(400).json({ error: "Invalid YouTube URL" });

  const item = {
    id: Date.now(),
    url,
    videoId
  };

  queue.push(item);
  saveQueue(queue);

  res.json(queue);
});

// Delete item
app.delete("/api/queue/:id", (req, res) => {
  const id = Number(req.params.id);
  queue = queue.filter(x => x.id !== id);
  saveQueue(queue);
  res.json(queue);
});

// Skip current video
app.post("/api/skip", (req, res) => {
  skipCurrent();
  res.json({ ok: true });
});

// ---- Start player loop ----
startPlayer({
  getQueue: () => queue,
  shiftQueue: () => {
    const item = queue.shift();
    saveQueue(queue);
    return item;
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});