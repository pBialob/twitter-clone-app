import { type NextApiRequest, type NextApiResponse } from "next";
import { prisma } from "~/server/db";
import { type Hashtag, Media, type Tweet } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const { authorId, content, hashtags, title, media } = JSON.parse(
      req.body as string
    ) as Tweet & { hashtags: Hashtag[]; media: Media[] };

    const updatedTweet: Tweet = await prisma.tweet.update({
      where: { id: req.query.id as string },
      data: {
        authorId,
        content,
        title,
        hashtags: {
          connectOrCreate: hashtags.map(({ name }) => ({
            where: { name },
            create: { name },
          })),
        },
        media: {
          create: media,
        },
      },
      include: {
        hashtags: true,
        media: true,
      },
    });

    res.status(200).json(updatedTweet);
  } catch (error) {
    console.error(error);
    // Send a more detailed error message
    res.status(500).json({
      error: "An error occurred while updating tweet.",
    });
  }
}
