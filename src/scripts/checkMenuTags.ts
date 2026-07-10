import connectDB from "../config/database";
import dotenv from "dotenv";
import Menu from "../models/Menu";

dotenv.config();

const run = async () => {
  try {
    await connectDB();
    console.log("Connected to DB successfully.");
    const menus = await Menu.find({}).lean();
    console.log(`Found ${menus.length} menu items.`);
    menus.forEach((m) => {
      console.log(`- Name: ${m.name}`);
      console.log(`  Priority: ${m.priority}`);
      console.log(`  Morning Special: ${m.morningSpecial}`);
      console.log(`  Evening Special: ${m.eveningSpecial}`);
      console.log(`  Dosa Special: ${m.dosaSpecial}`);
      console.log(`  Popular (raw): ${(m as any).popular}`);
      console.log(`  Chef Special (raw): ${(m as any).chefSpecial}`);
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    process.exit(0);
  }
};

run();
