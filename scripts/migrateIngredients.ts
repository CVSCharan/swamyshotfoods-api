import mongoose from "mongoose";
import dotenv from "dotenv";
import Menu from "../src/models/Menu";
import Logger from "../src/config/logger";

dotenv.config();

// Parse ingredient text and extract individual ingredients
function parseIngredients(ingredientText: string): string[] {
  if (!ingredientText || ingredientText.trim() === "") {
    return [];
  }

  // Remove unicode formatting and "ingredients:" prefix
  const normalized = ingredientText
    .replace(/[\u{1D400}-\u{1D7FF}]/gu, (char) => {
      const code = char.codePointAt(0)!;
      if (code >= 0x1d400 && code <= 0x1d433)
        return String.fromCharCode(code - 0x1d400 + 65);
      if (code >= 0x1d434 && code <= 0x1d467)
        return String.fromCharCode(code - 0x1d434 + 97);
      if (code >= 0x1d7ce && code <= 0x1d7d7)
        return String.fromCharCode(code - 0x1d7ce + 48);
      return char;
    })
    .replace(/ingredients?\s*:?\s*/i, "")
    .trim();

  // Split by common separators: &, comma, "and"
  const ingredients = normalized
    .split(/[&,]|\\n|\sand\s/i)
    .map((ing) => ing.trim())
    .filter((ing) => ing.length > 0 && ing.length < 100); // Filter out empty and too long strings

  return ingredients;
}

// Determine dietary labels based on ingredients
function determineDietaryLabels(ingredients: string[]): string[] {
  const labels = ["vegetarian"]; // Default for South Indian food

  const ingredientText = ingredients.join(" ").toLowerCase();

  // Check for vegan (no dairy products)
  const hasDairy = /milk|ghee|butter|curd|paneer|cheese/i.test(ingredientText);
  if (!hasDairy) {
    labels.push("vegan");
  }

  // Check for Jain (no onion/garlic/root vegetables)
  const hasNonJain = /onion|garlic|potato|carrot|beetroot/i.test(
    ingredientText
  );
  if (!hasNonJain) {
    labels.push("jain");
  }

  // Check for gluten-free (no wheat/maida)
  const hasGluten = /wheat|maida|atta|bread/i.test(ingredientText);
  if (!hasGluten) {
    labels.push("gluten-free");
  }

  return labels;
}

// Detect common allergens
function detectAllergens(ingredients: string[]): string[] {
  const allergens: string[] = [];
  const ingredientText = ingredients.join(" ").toLowerCase();

  if (/milk|dairy|ghee|butter|curd|paneer/i.test(ingredientText)) {
    allergens.push("dairy");
  }

  if (/peanut|almond|cashew|walnut|pistachio|nut/i.test(ingredientText)) {
    allergens.push("nuts");
  }

  if (/wheat|maida|atta|gluten/i.test(ingredientText)) {
    allergens.push("gluten");
  }

  if (/soy|soya/i.test(ingredientText)) {
    allergens.push("soy");
  }

  return allergens;
}

const migrateIngredients = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/swamyshotfoods"
    );
    Logger.info("MongoDB Connected");

    const items = await Menu.find({});
    Logger.info(`Found ${items.length} menu items to process`);

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    console.log("\n=== Migrating Ingredients ===\n");

    for (const item of items) {
      const itemData = item.toObject() as any;
      const ingredientText = itemData.ingredients;

      // Skip if already migrated (is array)
      if (Array.isArray(ingredientText)) {
        console.log(`⊘ Skipped: ${item.name} (already migrated)`);
        skipCount++;
        continue;
      }

      try {
        const ingredients = parseIngredients(ingredientText);
        const dietaryLabels = determineDietaryLabels(ingredients);
        const allergens = detectAllergens(ingredients);

        await Menu.updateOne(
          { _id: item._id },
          {
            $set: {
              ingredients: ingredients.length > 0 ? ingredients : ["rice"],
              dietaryLabels,
              allergens,
            },
          }
        );

        console.log(`✓ Migrated: ${item.name}`);
        console.log(`  Ingredients: ${ingredients.join(", ")}`);
        console.log(`  Dietary: ${dietaryLabels.join(", ")}`);
        if (allergens.length > 0) {
          console.log(`  Allergens: ${allergens.join(", ")}`);
        }
        console.log("");

        successCount++;
      } catch (error) {
        console.error(`✗ Error migrating ${item.name}:`, error);
        errorCount++;
      }
    }

    console.log("\n=== Migration Summary ===");
    console.log(`✓ Successfully migrated: ${successCount}`);
    console.log(`⊘ Skipped: ${skipCount}`);
    console.log(`✗ Errors: ${errorCount}`);
    console.log("");

    await mongoose.connection.close();
    Logger.info("Connection Closed");
    process.exit(0);
  } catch (error) {
    Logger.error(`Error: ${(error as Error).message}`);
    process.exit(1);
  }
};

migrateIngredients();
