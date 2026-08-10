const { spawn } = require("child_process");
const ngrok = require("@ngrok/ngrok");

const PORT = 4000;
const NGROK_AUTHTOKEN = "3GspicqpsjfZbeRc12EyicMQP83_4bkxS2WAtfUEP9nsJH8pi";

async function main() {
  console.log("\x1b[36m%s\x1b[0m", "==================================================");
  console.log("\x1b[1m\x1b[33m%s\x1b[0m", " 🚀 Starting Portfolio Server & ngrok Tunnel... ");
  console.log("\x1b[36m%s\x1b[0m", "==================================================\n");

  // 1. Start Next.js server on port 4000
  const nextDev = spawn(
    process.execPath,
    ["node_modules/next/dist/bin/next", "dev", "-p", String(PORT)],
    {
      stdio: "inherit",
      env: { ...process.env },
    }
  );

  nextDev.on("error", (err) => {
    console.error("Failed to start Next.js dev server:", err);
  });

  // 2. Connect ngrok Tunnel
  try {
    const listener = await ngrok.forward({
      addr: PORT,
      authtoken: NGROK_AUTHTOKEN,
    });

    const publicUrl = listener.url();

    console.log("\n\x1b[32m%s\x1b[0m", "--------------------------------------------------");
    console.log("\x1b[1m\x1b[32m%s\x1b[0m", " ✅ NGROK TUNNEL ACTIVATED SUCCESSFULLY! ");
    console.log("\x1b[32m%s\x1b[0m", "--------------------------------------------------");
    console.log(` 🌐 Public URL:  \x1b[1m\x1b[36m${publicUrl}\x1b[0m`);
    console.log(` 💻 Local URL:   \x1b[1mhttp://localhost:${PORT}\x1b[0m`);
    console.log("\x1b[32m%s\x1b[0m", "--------------------------------------------------\n");

    process.on("SIGINT", async () => {
      console.log("\nStopping ngrok tunnel and server...");
      try {
        await listener.close();
      } catch (e) {}
      nextDev.kill();
      process.exit(0);
    });
  } catch (err) {
    console.error("\x1b[31m%s\x1b[0m", "❌ ngrok Connection Info:", err.message || err);
  }
}

main();
