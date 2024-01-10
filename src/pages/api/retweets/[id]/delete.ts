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
    // Delete retweet
    await prisma.retweet.delete({
      where: { id: req.query.id as string },
    });

    res.status(200).send({
      message: "Retweet deleted successfully",
    });
  } catch (error) {
    console.error(error);
    // Send a more detailed error message
    res.status(500).json({
      error: "An error occurred while deleting the retweet.",
      details: error.message || error,
    });
  }
}
