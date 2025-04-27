import { db } from "@/configs/db";
import { eq } from "drizzle-orm";
import { users } from "@/configs/schema";

export async function StoreUser(userData: {
  id: string;
  email: string;
  name: string;
}) {
  try {
    console.log("StoreUser called with data:", userData);
    
    const { id, email, name } = userData;
    
    if (!id) {
      console.error("User ID is required");
      return null;
    }

    // Check if user exists
    console.log("Checking for existing user with clerk_id:", id);
    const existingUsers = await db.select().from(users).where(eq(users.clerk_id, id));
    
    if (existingUsers.length > 0) {
      console.log("User already exists:", existingUsers[0]);
      return existingUsers[0];
    }

    // Create new user
    console.log("Creating new user with data:", { clerk_id: id, email, name });
    const [newUser] = await db.insert(users).values({
      clerk_id: id,
      email,
      name,
    }).returning();
    
    console.log("User stored successfully:", newUser);
    return newUser;
  } catch (error) {
    console.error("Error storing user:", error);
    return null;
  }
} 