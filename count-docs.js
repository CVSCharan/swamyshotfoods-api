const mongoose = require("mongoose");
const StoreConfig = require("./src/models/StoreConfig").default;
async function test() {
  await mongoose.connect("mongodb://localhost:27017/swamyshotfoods");
  const count = await StoreConfig.countDocuments();
  console.log("Count:", count);
  process.exit(0);
}
test();
