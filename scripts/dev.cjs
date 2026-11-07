const { spawn } = require("child_process");

console.log("🚀 Starting AkaTech IT Solution (Backend + Frontend)...");

const server = spawn("node", ["server/server.cjs"], {
  stdio: "inherit",
  shell: true,
});

const client = spawn("npx", ["vite"], {
  stdio: "inherit",
  shell: true,
});

const cleanup = () => {
  try {
    server.kill();
  } catch {}
  try {
    client.kill();
  } catch {}
  process.exit();
};

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
process.on("exit", cleanup);
