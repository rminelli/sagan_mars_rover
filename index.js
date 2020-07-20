const express = require("express");
const app = express();
const Main = require("./controllers/main.controller")();
const port = 8000;

app.get("/", (req, res) => {
  try {
    const data = Main.init();
    res.send(data);
  } catch (error) {
    return { errorCode: 500, error: error.message };
  }
});

app.listen(port, async () => {
  console.log(`Backend running on port: http://localhost:${port}`);
});
