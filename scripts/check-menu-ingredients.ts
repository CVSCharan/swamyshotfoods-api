import dotenv from "dotenv";
import mongoose from "mongoose";
import Menu from "../src/models/Menu";

dotenv.config();

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

interface MenuValidation {
  menuItem: any;
  validation: ValidationResult;
}

/**
 * Validates if ingredients are in proper format
 * - Should be an array
 * - Should not be empty
 * - Each ingredient should be a non-empty string
 * - Ingredients should be properly capitalized
 */
function validateIngredients(ingredients: any): ValidationResult {
  const errors: string[] = [];

  // Check if ingredients is an array
  if (!Array.isArray(ingredients)) {
    errors.push("Ingredients is not an array");
    return { isValid: false, errors };
  }

  // Check if ingredients array is empty
  if (ingredients.length === 0) {
    errors.push("Ingredients array is empty");
  }

  // Validate each ingredient
  ingredients.forEach((ingredient, index) => {
    // Check if ingredient is a string
    if (typeof ingredient !== "string") {
      errors.push(`Ingredient at index ${index} is not a string: ${ingredient}`);
      return;
    }

    // Check if ingredient is empty or just whitespace
    if (ingredient.trim() === "") {
      errors.push(`Ingredient at index ${index} is empty or whitespace`);
      return;
    }

    // Check for proper capitalization (first letter should be uppercase)
    if (ingredient[0] !== ingredient[0].toUpperCase()) {
      errors.push(
        `Ingredient at index ${index} should start with uppercase: "${ingredient}"`
      );
    }

    // Check for extra whitespace
    if (ingredient !== ingredient.trim()) {
      errors.push(
        `Ingredient at index ${index} has leading/trailing whitespace: "${ingredient}"`
      );
    }

    // Check for multiple consecutive spaces
    if (/\s{2,}/.test(ingredient)) {
      errors.push(
        `Ingredient at index ${index} has multiple consecutive spaces: "${ingredient}"`
      );
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

async function checkMenuIngredients() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/swamyshotfoods";
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB\n");

    // Fetch all menu items
    const menuItems = await Menu.find({}).lean();
    console.log(`📋 Found ${menuItems.length} menu items\n`);

    if (menuItems.length === 0) {
      console.log("⚠️  No menu items found in the database");
      return;
    }

    const validationResults: MenuValidation[] = [];
    let validCount = 0;
    let invalidCount = 0;

    // Validate each menu item
    menuItems.forEach((item) => {
      const validation = validateIngredients(item.ingredients);
      validationResults.push({
        menuItem: item,
        validation,
      });

      if (validation.isValid) {
        validCount++;
      } else {
        invalidCount++;
      }
    });

    // Display results
    console.log("=" .repeat(80));
    console.log("VALIDATION SUMMARY");
    console.log("=".repeat(80));
    console.log(`✅ Valid: ${validCount}`);
    console.log(`❌ Invalid: ${invalidCount}`);
    console.log("=".repeat(80));
    console.log();

    // Display detailed results for each menu item
    validationResults.forEach(({ menuItem, validation }, index) => {
      console.log(`\n${index + 1}. ${menuItem.name}`);
      console.log("-".repeat(80));
      console.log(`   ID: ${menuItem._id}`);
      console.log(`   Price: ₹${menuItem.price}`);
      console.log(`   Ingredients: ${JSON.stringify(menuItem.ingredients, null, 2)}`);

      if (validation.isValid) {
        console.log(`   ✅ Status: VALID`);
      } else {
        console.log(`   ❌ Status: INVALID`);
        console.log(`   Errors:`);
        validation.errors.forEach((error) => {
          console.log(`      - ${error}`);
        });
      }
    });

    console.log("\n" + "=".repeat(80));
    console.log("DETAILED INGREDIENT ANALYSIS");
    console.log("=".repeat(80));

    // Show all unique ingredients across all menu items
    const allIngredients = new Set<string>();
    menuItems.forEach((item) => {
      if (Array.isArray(item.ingredients)) {
        item.ingredients.forEach((ing) => allIngredients.add(ing));
      }
    });

    console.log(`\n📊 Total unique ingredients: ${allIngredients.size}`);
    console.log("\nAll ingredients:");
    Array.from(allIngredients)
      .sort()
      .forEach((ing, idx) => {
        console.log(`   ${idx + 1}. ${ing}`);
      });

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\n✅ Database connection closed");
  }
}

// Run the script
checkMenuIngredients();
