const express = require("express");
const router = express.Router();
const { addDummyHistory } = require("../controllers/productHistoryController");

router.post("/add-dummy", addDummyHistory);

module.exports = router;