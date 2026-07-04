const mongoose = require("mongoose");
const StoreConfig = require("./src/models/StoreConfig").default;

async function test() {
  await mongoose.connect("mongodb://localhost:27017/swamyshotfoods");
  console.log("Connected");
  
  let config = await StoreConfig.findOne();
  console.log("Before:", config.menuFooterMessage);
  
  config.set({ menuFooterMessage: "Test Message " + Date.now() });
  await config.save();
  
  let configAfter = await StoreConfig.findOne();
  console.log("After:", configAfter.menuFooterMessage);
  process.exit(0);
}
test();
