import mongoose from "mongoose";
import dotenv from "dotenv";
import Menu from "../src/models/Menu";
import Logger from "../src/config/logger";

dotenv.config();

const getAllMenuIngredients = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/swamyshotfoods"
    );
    Logger.info("MongoDB Connected\n");

    const menuItems = await Menu.find({}).sort({ priority: 1 }).lean();
    console.log(`📋 Total Menu Items: ${menuItems.length}\n`);
    console.log("=".repeat(100));

    menuItems.forEach((item, index) => {
      console.log(`\n${index + 1}. ${item.name}`);
      console.log("-".repeat(100));
      console.log(`   ID: ${item._id}`);
      console.log(`   Priority: ${item.priority}`);
      console.log(`   Price: ₹${item.price}`);
      
      // Check ingredient format
      const ingredients = item.ingredients;
      const isArray = Array.isArray(ingredients);
      const isProperFormat = isArray && ingredients.every((ing: any) => 
        typeof ing === 'string' && 
        ing.trim() === ing && 
        !ing.includes('𝗶𝗻𝗴𝗿𝗲𝗱𝗶𝗲𝗻𝘁𝘀') &&
        !ing.includes('\\n')
      );

      console.log(`   Format Status: ${isProperFormat ? '✅ GOOD' : '❌ NEEDS FIX'}`);
      console.log(`   Current Ingredients:`);
      
      if (isArray) {
        if (ingredients.length === 0) {
          console.log(`      ⚠️  Empty array`);
        } else {
          ingredients.forEach((ing: string, idx: number) => {
            const hasIssue = 
              ing.includes('𝗶𝗻𝗴𝗿𝗲𝗱𝗶𝗲𝗻𝘁𝘀') || 
              ing.includes('\\n') ||
              ing !== ing.trim() ||
              ing.length > 100;
            
            console.log(`      ${idx + 1}. ${hasIssue ? '❌' : '✅'} "${ing}"`);
          });
        }
      } else {
        console.log(`      ❌ NOT AN ARRAY: ${typeof ingredients}`);
        console.log(`      Value: ${JSON.stringify(ingredients)}`);
      }
    });

    console.log("\n" + "=".repeat(100));
    console.log("\n📊 SUMMARY\n");
    
    const goodFormat = menuItems.filter((item: any) => {
      const ingredients = item.ingredients;
      return Array.isArray(ingredients) && 
        ingredients.length > 0 &&
        ingredients.every((ing: any) => 
          typeof ing === 'string' && 
          ing.trim() === ing && 
          !ing.includes('𝗶𝗻𝗴𝗿𝗲𝗱𝗶𝗲𝗻𝘁𝘀') &&
          !ing.includes('\\n')
        );
    });

    const needsFix = menuItems.length - goodFormat.length;

    console.log(`✅ Good Format: ${goodFormat.length} items`);
    console.log(`❌ Needs Fix: ${needsFix} items`);
    console.log("\n" + "=".repeat(100));

    await mongoose.connection.close();
    Logger.info("\nConnection Closed");
    process.exit(0);
  } catch (error) {
    Logger.error(`Error: ${(error as Error).message}`);
    process.exit(1);
  }
};

getAllMenuIngredients();
