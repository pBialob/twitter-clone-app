/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { type NextApiRequest, type NextApiResponse } from "next";
import { prisma } from "~/server/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });
  const tweet = req.body;

  try {
    console.log("LOG: ", tweet);
    const newTweet = await prisma.tweet.create({
      data: JSON.parse(tweet),
    });
    res.status(200).json(newTweet);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "An error occurred while creating tweet.",
    });
  }
}
