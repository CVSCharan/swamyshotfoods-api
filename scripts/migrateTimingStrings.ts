import mongoose from "mongoose";
import dotenv from "dotenv";
import Menu from "../src/models/Menu";
import Logger from "../src/config/logger";

dotenv.config();

// Parse timing strings and extract structured data
function parseTimingString(timingStr: string): {
  morning?: { startTime: string; endTime: string };
  evening?: { startTime: string; endTime: string };
} {
  const result: {
    morning?: { startTime: string; endTime: string };
    evening?: { startTime: string; endTime: string };
  } = {};

  // Normalize the string (remove unicode formatting characters)
  const normalized = timingStr
    .replace(/[\u{1D400}-\u{1D7FF}]/gu, (char) => {
      // Convert unicode formatted characters to regular ASCII
      const code = char.codePointAt(0)!;
      if (code >= 0x1d400 && code <= 0x1d433)
        return String.fromCharCode(code - 0x1d400 + 65); // Bold uppercase
      if (code >= 0x1d434 && code <= 0x1d467)
        return String.fromCharCode(code - 0x1d434 + 97); // Bold lowercase
      if (code >= 0x1d7ce && code <= 0x1d7d7)
        return String.fromCharCode(code - 0x1d7ce + 48); // Bold digits
      return char;
    })
    .toLowerCase();

  // Extract morning timings
  const morningMatch = normalized.match(
    /morning[:\s-]+(\d+)\.?(\d+)?\s*(?:am|to)?\s*(?:to)?\s*(\d+)\.?(\d+)?\s*(am)?/i
  );
  if (morningMatch) {
    const startHour = morningMatch[1];
    const startMin = morningMatch[2] || "00";
    const endHour = morningMatch[3];
    const endMin = morningMatch[4] || "00";

    result.morning = {
      startTime: `${startHour}:${startMin}am`,
      endTime: `${endHour}:${endMin}am`,
    };
  }

  // Extract evening timings
  const eveningMatch = normalized.match(
    /evening[:\s-]+(\d+)\.?(\d+)?\s*(?:pm|to)?\s*(?:to)?\s*(\d+)\.?(\d+)?\s*(pm)?/i
  );
  if (eveningMatch) {
    const startHour = eveningMatch[1];
    const startMin = eveningMatch[2] || "00";
    const endHour = eveningMatch[3];
    const endMin = eveningMatch[4] || "00";

    result.evening = {
      startTime: `${startHour}:${startMin}pm`,
      endTime: `${endHour}:${endMin}pm`,
    };
  }

  return result;
}

const migrateTimingStrings = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/swamyshotfoods"
    );
    Logger.info("MongoDB Connected");

    // Find all menu items with timing strings
    const items = await Menu.find({});
    Logger.info(`Found ${items.length} menu items to process`);

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    console.log("\n=== Migrating Timing Strings ===\n");

    for (const item of items) {
      const itemData = item.toObject() as any;
      const timingStr = itemData.timings;

      if (!timingStr) {
        console.log(`⊘ Skipped: ${item.name} (no timing string)`);
        skipCount++;
        continue;
      }

      try {
        const parsed = parseTimingString(timingStr);

        await Menu.updateOne(
          { _id: item._id },
          {
            $set: {
              morningTimings: parsed.morning || null,
              eveningTimings: parsed.evening || null,
            },
            $unset: { timings: "" }, // Remove the old timings field
          }
        );

        console.log(`✓ Migrated: ${item.name}`);
        if (parsed.morning) {
          console.log(
            `  Morning: ${parsed.morning.startTime} - ${parsed.morning.endTime}`
          );
        }
        if (parsed.evening) {
          console.log(
            `  Evening: ${parsed.evening.startTime} - ${parsed.evening.endTime}`
          );
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

migrateTimingStrings();
