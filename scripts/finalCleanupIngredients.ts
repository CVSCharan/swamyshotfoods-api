import mongoose from "mongoose";
import dotenv from "dotenv";
import Menu from "../src/models/Menu";
import Logger from "../src/config/logger";

dotenv.config();

// Thoroughly clean ingredient text
function cleanIngredient(text: string): string[] {
  if (!text || typeof text !== 'string') return [];
  
  // Split by newlines first to separate multi-part ingredients
  const parts = text.split(/\\n+|\n+/).map(p => p.trim()).filter(p => p.length > 0);
  
  const cleaned: string[] = [];
  
  for (const part of parts) {
    // Remove all possible prefix patterns
    let cleanPart = part
      .replace(/^.*?ingredients?\s*:\s*/i, '') // Remove any "xxx ingredients :"
      .replace(/^fried\s+(in|with)\s+/i, '') // Remove "fried in/with" prefix
      .trim();
    
    // Skip if empty after cleaning
    if (!cleanPart || cleanPart.length === 0) continue;
    
    // If it contains commas or "and", split it further
    if (cleanPart.includes(',') || /\sand\s/i.test(cleanPart)) {
      const subParts = cleanPart
        .split(/[,]|\sand\s/i)
        .map(s => s.trim())
        .filter(s => s.length > 0 && s.length < 100);
      
      cleaned.push(...subParts);
    } else {
      // Single ingredient
      if (cleanPart.length < 100) {
        cleaned.push(cleanPart);
      }
    }
  }
  
  // Capitalize first letter and remove trailing periods
  return cleaned.map(ing => {
    let clean = ing.replace(/\.+$/, '').trim();
    if (clean.length > 0) {
      clean = clean.charAt(0).toUpperCase() + clean.slice(1);
    }
    return clean;
  }).filter(ing => ing.length > 0);
}

const finalCleanup = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/swamyshotfoods"
    );
    Logger.info("MongoDB Connected");

    const items = await Menu.find({});
    Logger.info(`Found ${items.length} menu items to clean`);

    let successCount = 0;
    let skipCount = 0;

    console.log("\n=== Final Ingredient Cleanup ===\n");

    for (const item of items) {
      const itemData = item.toObject() as any;
      const currentIngredients = itemData.ingredients;

      if (!Array.isArray(currentIngredients)) {
        console.log(`⊘ Skipped: ${item.name} (not an array)`);
        skipCount++;
        continue;
      }

      // Process each ingredient
      let allCleanedIngredients: string[] = [];
      
      for (const ing of currentIngredients) {
        const cleaned = cleanIngredient(ing);
        allCleanedIngredients.push(...cleaned);
      }

      // Remove duplicates while preserving order
      const uniqueIngredients = [...new Set(allCleanedIngredients)];

      // Fix common typos
      const fixedIngredients = uniqueIngredients.map(ing => 
        ing
          .replace(/bolied/gi, 'boiled')
          .replace(/\s{2,}/g, ' ') // Remove multiple spaces
          .trim()
      );

      // Check if anything changed
      const hasChanges = JSON.stringify(currentIngredients) !== JSON.stringify(fixedIngredients);

      if (!hasChanges) {
        console.log(`⊘ Skipped: ${item.name} (already clean)`);
        skipCount++;
        continue;
      }

      await Menu.updateOne(
        { _id: item._id },
        {
          $set: {
            ingredients: fixedIngredients,
          },
        }
      );

      console.log(`✓ Cleaned: ${item.name}`);
      console.log(`  Before (${currentIngredients.length} items): ${currentIngredients.slice(0, 2).join(", ")}...`);
      console.log(`  After (${fixedIngredients.length} items):  ${fixedIngredients.slice(0, 2).join(", ")}...`);
      console.log("");

      successCount++;
    }

    console.log("\n=== Cleanup Summary ===");
    console.log(`✓ Successfully cleaned: ${successCount}`);
    console.log(`⊘ Skipped: ${skipCount}`);
    console.log("");

    await mongoose.connection.close();
    Logger.info("Connection Closed");
    process.exit(0);
  } catch (error) {
    Logger.error(`Error: ${(error as Error).message}`);
    process.exit(1);
  }
};

finalCleanup();
