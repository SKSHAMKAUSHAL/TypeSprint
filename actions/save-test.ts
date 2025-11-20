"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// 1. Validation Schema
const ResultSchema = z.object({
  wpm: z.number().min(0).max(400),
  accuracy: z.number().min(0).max(100),
  mode: z.string(),
  userId: z.string(), // In real app, extract this from session, don't pass from client
});

export async function saveTestResult(input: z.infer<typeof ResultSchema>) {
  // 2. Validate Input
  const data = ResultSchema.parse(input);

  try {
    // 3. Transaction: Save Result & Update Leaderboard if PB
    await prisma.$transaction(async (tx) => {
      // A. Save the raw history
      await tx.testResult.create({
        data: {
          wpm: data.wpm,
          accuracy: data.accuracy,
          mode: data.mode,
          userId: data.userId,
        },
      });

      // B. Check existing PB
      const currentBest = await tx.leaderboard.findUnique({
        where: { userId: data.userId },
      });

      // C. Upsert if this is a better score (or no score exists)
      if (!currentBest || data.wpm > currentBest.wpm) {
        await tx.leaderboard.upsert({
          where: { userId: data.userId },
          update: {
            wpm: data.wpm,
            accuracy: data.accuracy,
            mode: data.mode,
          },
          create: {
            userId: data.userId,
            wpm: data.wpm,
            accuracy: data.accuracy,
            mode: data.mode,
          },
        });
      }
    });

    revalidatePath("/"); // Update homepage leaderboard
    return { success: true };
  } catch (error) {
    console.error("Failed to save score:", error);
    return { success: false, error: "Failed to save score" };
  }
}
