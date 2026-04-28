const { spawn } = require("child_process");

let currentProcess = null;
let skipFlag = false;

function play(url) {
  return new Promise((resolve) => {
    console.log("Playing:", url);

    currentProcess = spawn("mpv", [url, "--no-terminal"]);

    const cleanup = () => {
      currentProcess = null;
      resolve();
    };

    currentProcess.on("exit", cleanup);

    currentProcess.on("error", (err) => {
      console.error("mpv error:", err);
      cleanup();
    });

    // skip support
    const interval = setInterval(() => {
      if (skipFlag && currentProcess) {
        console.log("Skipping...");
        currentProcess.kill("SIGTERM");
        skipFlag = false;
        clearInterval(interval);
      }
    }, 500);
  });
}

async function startPlayer({ getQueue, shiftQueue }) {
  while (true) {
    const queue = getQueue();

    if (!queue.length) {
      await new Promise(r => setTimeout(r, 1000));
      continue;
    }

    const next = shiftQueue();
    await play(next.url);
  }
}

function skipCurrent() {
  skipFlag = true;
}

module.exports = {
  startPlayer,
  skipCurrent
};