const { spawn } = require("child_process");
const { get } = require("http");
const { exit } = require("process");

const { INPUT_BACKEND_PROXY_PORT, INPUT_ACTION_PATH } = process.env;

process.chdir(INPUT_ACTION_PATH);
spawn("node", ["backend-proxy.js"], {
  stdio: "inherit",
  detached: true
}).unref();

setTimeout(() => {
  console.log(`Calling http://localhost:${INPUT_BACKEND_PROXY_PORT}/ping...`);
  const req = get(`http://localhost:${INPUT_BACKEND_PROXY_PORT}/ping`, {
    timeout: 5000
  }, (res) => {
    if (res.statusCode !== 200) {
      console.log("::error::Ping to localhost failed");
      exit(1);
    }
    console.log("Received 200 OK");
    exit(0);
  });

  req.on("timeout", () => {
    req.destroy();
    console.log("::error::Ping to localhost timed out");
    exit(1);
  })
}, 1000); // Delay to allow server startup