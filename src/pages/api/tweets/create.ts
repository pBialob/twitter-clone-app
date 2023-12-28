import { type NextApiRequest, type NextApiResponse } from "next";
import { prisma } from "~/server/db";
import { type Hashtag, type Tweet } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });
  const { authorId, content, hashtags } = JSON.parse(
    req.body as string
  ) as Tweet & { hashtags: Hashtag[] };
  console.log("Hashtags: ", hashtags);
  try {
    const newTweet: Tweet = await prisma.tweet.create({
      data: {
        authorId,
        content,
        hashtags: {
          connectOrCreate: hashtags.map(({ name }) => ({
            where: { name },
            create: { name },
          })),
        },
      },
    });
    res.status(200).json(newTweet);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "An error occurred while creating tweet.",
    });
  }
}
