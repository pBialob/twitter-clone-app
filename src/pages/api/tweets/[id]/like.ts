/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { type NextApiRequest, type NextApiResponse } from "next";
import { prisma } from "~/server/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const tweetId = req.query.id as string;
  if (!tweetId) {
    return res.status(400).json({ error: "Tweet ID is required" });
  }

  let body;
  try {
    body = JSON.parse(req.body as string);
  } catch (error) {
    return res.status(400).json({ error: "Invalid JSON" });
  }

  const { userId } = body;
  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    // Check if the like already exists
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_tweetId: {
          userId: userId,
          tweetId: tweetId,
        },
      },
    });

    if (existingLike) {
      return res.status(409).json({ error: "Tweet already liked by the user" });
    }

    // Directly create a new like
    await prisma.like.create({
      data: {
        userId: userId,
        tweetId: tweetId,
      },
    });

    res.status(201).json({
      message: "Tweet liked successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "An error occurred while liking the tweet.",
      details: error.message || error,
    });
  }
}
