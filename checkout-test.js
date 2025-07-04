const express = require("express");
const app = express();

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send(`
    <form method="POST" action="/checkout">
      <button type="submit">Test Checkout</button>
    </form>
  `);
});

app.post("/checkout", (req, res) => {
  console.log("✅ POST /checkout received");
  res.send("✅ Checkout successful");
});

app.listen(3000, () => console.log("✅ Test server running on http://localhost:3000"));
