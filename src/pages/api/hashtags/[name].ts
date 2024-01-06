/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "~/server/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET")
    return res.status(405).json({ error: "Method not allowed" });

  const hashtagName = req.query.name as string;
  console.log(hashtagName);

  try {
    const tweets = await prisma.tweet.findMany({
      where: {
        hashtags: {
          some: {
            name: hashtagName,
          },
        },
      },
      include: {
        author: true,
        hashtags: true,
        media: true,
      },
    });
    res.status(200).json(tweets);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching restaurants." });
  }
}
