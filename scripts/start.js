const { spawn, execSync } = require("child_process");
const http = require("http");
const path = require("path");
const fs = require("fs");

// Load dotenv to check if PRIVATE_KEY is configured for external networks
require("dotenv").config();

const targetNetwork = process.argv[2] || "localhost";

function checkNodeReady() {
  return new Promise((resolve) => {
    const req = http.request(
      {
        host: "127.0.0.1",
        port: 8545,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      },
      (res) => {
        resolve(true);
      }
    );
    req.on("error", () => {
      resolve(false);
    });
    req.write(
      JSON.stringify({
        jsonrpc: "2.0",
        method: "web3_clientVersion",
        params: [],
        id: 1,
      })
    );
    req.end();
  });
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  let nodeProcess = null;

  if (targetNetwork === "localhost") {
    console.log("Starting local Hardhat node...");
    nodeProcess = spawn("npx", ["hardhat", "node"], {
      shell: true,
      stdio: "inherit",
    });

    // Wait for node to be ready
    console.log("Waiting for Hardhat node to start...");
    let ready = false;
    for (let i = 0; i < 20; i++) {
      ready = await checkNodeReady();
      if (ready) break;
      await sleep(1000);
    }

    if (!ready) {
      console.error("Hardhat node failed to start in time.");
      nodeProcess.kill();
      process.exit(1);
    }
    console.log("Hardhat node is ready!");
  } else {
    console.log(`Using external network: ${targetNetwork}`);
    // Check if dotenv or env has PRIVATE_KEY
    if (!process.env.PRIVATE_KEY) {
      console.error("\nError: PRIVATE_KEY is not defined in your environment or .env file.");
      console.error("Please create a '.env' file in the root directory with your private key:");
      console.error("PRIVATE_KEY=your_private_key_here\n");
      process.exit(1);
    }
  }

  console.log(`Deploying smart contracts to ${targetNetwork}...`);
  try {
    execSync(`npx hardhat run scripts/deploy.js --network ${targetNetwork}`, {
      stdio: "inherit",
      shell: true,
    });
    console.log("Smart contracts deployed successfully!");
  } catch (error) {
    console.error("Failed to deploy contracts:", error);
    if (nodeProcess) nodeProcess.kill();
    process.exit(1);
  }

  console.log("Starting frontend...");
  const frontendProcess = spawn("npm", ["run", "dev"], {
    cwd: path.join(__dirname, "..", "frontend"),
    shell: true,
    stdio: "inherit",
  });

  // Handle termination signals to cleanly kill child processes
  const cleanup = () => {
    console.log("\nStopping all processes...");
    if (nodeProcess) {
      try {
        nodeProcess.kill();
      } catch (e) {}
    }
    try {
      frontendProcess.kill();
    } catch (e) {}
    process.exit();
  };

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);
}

main();
