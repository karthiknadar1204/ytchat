'use server';

import { db } from '@/configs/db';
import { collections, users } from '@/configs/schema';
import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';

export async function createCollection(name: string, description: string, clerkUserId: string) {
  console.log('Server: createCollection called with:', { name, description, clerkUserId });
  try {
    if (!clerkUserId) {
      console.log('Server: No authenticated user found');
      return { success: false, error: 'User not authenticated' };
    }

    console.log('Server: Inserting collection into database');
    const result = await db.insert(collections).values({
      name,
      description,
      userId: clerkUserId,
      isPublic: false,
    }).returning();
    console.log('Server: Collection inserted successfully:', result[0]);

    revalidatePath('/dashboard');
    return { success: true, data: result[0] };
  } catch (error) {
    console.error('Server: Error creating collection:', error);
    return { success: false, error: 'Failed to create collection' };
  }
} 