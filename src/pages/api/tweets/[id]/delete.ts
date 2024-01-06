import { type NextApiRequest, type NextApiResponse } from "next";
import { prisma } from "~/server/db";
import { type Hashtag, Media, type Tweet } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    // Perform the delete operation
    await prisma.tweet.delete({
      where: { id: req.query.id as string },
      include: {
        hashtags: true,
        media: true,
      },
    });
    res.status(200).send({
      message: "Tweet deleted successfully",
    });
  } catch (error) {
    console.error(error);
    // Send a more detailed error message
    res.status(500).json({
      error: "An error occurred while deleting the tweet.",
      details: error.message || error,
    });
  }
}
