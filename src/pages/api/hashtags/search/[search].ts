import { Hashtag } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "~/server/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Array<Hashtag> | { error: string }>
) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    console.log(req.query.search);
    const searchQuery = (req.query.search as string) || "";

    const hashtags = await prisma.hashtag.findMany({
      where: {
        name: {
          contains: searchQuery.toLowerCase(),
        },
      },
    });

    res.status(200).json(hashtags);
  } catch (error) {
    console.error("Error fetching hashtags:", error); // Improved error logging
    res
      .status(500)
      .json({ error: "An error occurred while fetching hashtags." });
  }
}
