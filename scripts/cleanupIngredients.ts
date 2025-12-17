import mongoose from "mongoose";
import dotenv from "dotenv";
import Menu from "../src/models/Menu";
import Logger from "../src/config/logger";

dotenv.config();

// Clean unicode formatted text
function cleanUnicodeText(text: string): string {
  if (!text) return "";
  
  // Map of unicode formatted characters to normal characters
  const unicodeMap: Record<string, string> = {
    // Bold letters
    '𝗔': 'A', '𝗕': 'B', '𝗖': 'C', '𝗗': 'D', '𝗘': 'E', '𝗙': 'F', '𝗚': 'G', '𝗛': 'H',
    '𝗜': 'I', '𝗝': 'J', '𝗞': 'K', '𝗟': 'L', '𝗠': 'M', '𝗡': 'N', '𝗢': 'O', '𝗣': 'P',
    '𝗤': 'Q', '𝗥': 'R', '𝗦': 'S', '𝗧': 'T', '𝗨': 'U', '𝗩': 'V', '𝗪': 'W', '𝗫': 'X',
    '𝗬': 'Y', '𝗭': 'Z',
    '𝗮': 'a', '𝗯': 'b', '𝗰': 'c', '𝗱': 'd', '𝗲': 'e', '𝗳': 'f', '𝗴': 'g', '𝗵': 'h',
    '𝗶': 'i', '𝗷': 'j', '𝗸': 'k', '𝗹': 'l', '𝗺': 'm', '𝗻': 'n', '𝗼': 'o', '𝗽': 'p',
    '𝗾': 'q', '𝗿': 'r', '𝘀': 's', '𝘁': 't', '𝘂': 'u', '𝘃': 'v', '𝘄': 'w', '𝘅': 'x',
    '𝘆': 'y', '𝘇': 'z',
    // Italic letters
    '𝘈': 'A', '𝘉': 'B', '𝘊': 'C', '𝘋': 'D', '𝘌': 'E', '𝘍': 'F', '𝘎': 'G', '𝘏': 'H',
    '𝘐': 'I', '𝘑': 'J', '𝘒': 'K', '𝘓': 'L', '𝘔': 'M', '𝘕': 'N', '𝘖': 'O', '𝘗': 'P',
    '𝘘': 'Q', '𝘙': 'R', '𝘚': 'S', '𝘛': 'T', '𝘜': 'U', '𝘝': 'V', '𝘞': 'W', '𝘟': 'X',
    '𝘠': 'Y', '𝘡': 'Z',
    '𝘢': 'a', '𝘣': 'b', '𝘤': 'c', '𝘥': 'd', '𝘦': 'e', '𝘧': 'f', '𝘨': 'g', '𝘩': 'h',
    '𝘪': 'i', '𝘫': 'j', '𝘬': 'k', '𝘭': 'l', '𝘮': 'm', '𝘯': 'n', '𝘰': 'o', '𝘱': 'p',
    '𝘲': 'q', '𝘳': 'r', '𝘴': 's', '𝘵': 't', '𝘶': 'u', '𝘷': 'v', '𝘸': 'w', '𝘹': 'x',
    '𝘺': 'y', '𝘻': 'z',
    // Numbers
    '𝟢': '0', '𝟣': '1', '𝟤': '2', '𝟥': '3', '𝟦': '4', '𝟧': '5', '𝟨': '6', '𝟩': '7',
    '𝟪': '8', '𝟫': '9',
  };

  let cleaned = text;
  
  // Replace all unicode characters
  for (const [unicode, normal] of Object.entries(unicodeMap)) {
    cleaned = cleaned.split(unicode).join(normal);
  }
  
  // Remove common prefixes
  cleaned = cleaned
    .replace(/^ingredients?\s*:\s*/i, "")
    .replace(/^dosa\s+ingredients?\s*:\s*/i, "")
    .replace(/^aalu\s+curry\s+ingredients?\s*:\s*/i, "")
    .replace(/^dal\s+powder\s+ingredients?\s*:\s*/i, "")
    .replace(/^upma\s+ingredients?\s*:\s*/i, "")
    .replace(/^bath\s+ingredients?\s*:\s*/i, "")
    .replace(/^spicy\s+chutney\s+ingredients?\s*:\s*/i, "")
    .replace(/^coconut\s+chutney\s+ingredients?\s*:\s*/i, "")
    .replace(/^onion\s+chutney\s+ingredients?\s*:\s*/i, "")
    .trim();
  
  // Remove trailing periods and extra dots
  cleaned = cleaned.replace(/\.+$/, "").trim();
  
  // Capitalize first letter
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }
  
  return cleaned;
}

const cleanupIngredients = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/swamyshotfoods"
    );
    Logger.info("MongoDB Connected");

    const items = await Menu.find({});
    Logger.info(`Found ${items.length} menu items to clean`);

    let successCount = 0;
    let skipCount = 0;

    console.log("\n=== Cleaning Unicode from Ingredients ===\n");

    for (const item of items) {
      const itemData = item.toObject() as any;
      const currentIngredients = itemData.ingredients;

      if (!Array.isArray(currentIngredients)) {
        console.log(`⊘ Skipped: ${item.name} (not an array)`);
        skipCount++;
        continue;
      }

      // Clean each ingredient
      const cleanedIngredients = currentIngredients
        .map((ing: string) => cleanUnicodeText(ing))
        .filter((ing: string) => ing.length > 0 && ing.length < 100);

      // Check if anything changed
      const hasChanges = JSON.stringify(currentIngredients) !== JSON.stringify(cleanedIngredients);

      if (!hasChanges) {
        console.log(`⊘ Skipped: ${item.name} (already clean)`);
        skipCount++;
        continue;
      }

      await Menu.updateOne(
        { _id: item._id },
        {
          $set: {
            ingredients: cleanedIngredients,
          },
        }
      );

      console.log(`✓ Cleaned: ${item.name}`);
      console.log(`  Before: ${currentIngredients.slice(0, 3).join(", ")}...`);
      console.log(`  After:  ${cleanedIngredients.slice(0, 3).join(", ")}...`);
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

cleanupIngredients();
