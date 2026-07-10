import connectDB from "../config/database";
import dotenv from "dotenv";
import Menu from "../models/Menu";

dotenv.config();

const run = async () => {
  try {
    await connectDB();
    console.log("Connected to DB.");

    const rawMenus = await Menu.find({}).lean();
    console.log(`Checking ${rawMenus.length} menu items...`);

    let fixCount = 0;
    for (const raw of rawMenus) {
      if (Array.isArray(raw.ingredients)) {
        console.log(`Found array ingredients in "${raw.name}":`, raw.ingredients);
        
        // Convert array to a comma-separated string
        const cleanedString = raw.ingredients.join(", ");
        
        // Use raw collection update to bypass mongoose validation during repair
        await Menu.collection.updateOne(
          { _id: raw._id },
          { $set: { ingredients: cleanedString } }
        );
        
        console.log(`- Fixed ingredients for "${raw.name}" to: "${cleanedString}"`);
        fixCount++;
      } else if (typeof raw.ingredients !== "string" && raw.ingredients !== undefined) {
        console.log(`Found non-string ingredients in "${raw.name}":`, typeof raw.ingredients, raw.ingredients);
        await Menu.collection.updateOne(
          { _id: raw._id },
          { $set: { ingredients: String(raw.ingredients) } }
        );
        fixCount++;
      }
    }

    console.log(`Completed check. Fixed ${fixCount} items.`);
  } catch (error) {
    console.error("Failed to clean ingredients:", error);
  } finally {
    process.exit(0);
  }
};

run();
