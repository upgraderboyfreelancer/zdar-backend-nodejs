import dotenv from "dotenv"
import fs from "fs"
import path from "path";
import { fileURLToPath } from "url";
// Resolve the .env path
const __filename = fileURLToPath(import.meta.url); // Get the current file path
const __dirname = path.dirname(__filename);       // Get the directory name
const envPath = path.resolve(__dirname, "../../.env");

export default function envLoad() {

  // Verify if the file exists
  if (!fs.existsSync(envPath)) {
    console.error(`.env file not found at ${envPath}`);
  } else {
    console.log(`Loading .env file from ${envPath}`);
    dotenv.config({ path: envPath });

    // Verify environment variable
    console.log("Loaded variables:", process.env.NODE_ENV || "SECRET_KEY not found");
  }
}