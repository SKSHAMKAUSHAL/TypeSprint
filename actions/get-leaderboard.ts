"use server";

import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

export const getLeaderboard = unstable_cache(
  async () => {
    // Fetch top 10 scores from the 24h window
    // Note: If using the separate Leaderboard table, query that. 
    // Below queries the raw results for "Today's Top 10" dynamic calculation.
    
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const topScores = await prisma.testResult.findMany({
      where: {
        createdAt: {
          gte: twentyFourHoursAgo,
        },
      },
      take: 10,
      orderBy: [
        { wpm: "desc" },
        { accuracy: "desc" },
      ],
      include: {
        user: {
          select: {
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    return topScores;
  },
  ["leaderboard-daily"], // Cache Key
  {
    revalidate: 60, // Revalidate every 60 seconds (Stale-While-Revalidate)
    tags: ["leaderboard"],
  }
);
