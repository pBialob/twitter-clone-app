import { type NextApiRequest, type NextApiResponse } from "next";
import { prisma } from "~/server/db";
import { type Comment } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });
  const { authorId, content, tweetId } = JSON.parse(
    req.body as string
  ) as Comment;

  try {
    const newComment: Comment = await prisma.comment.create({
      data: {
        authorId,
        content,
        tweetId,
      },
    });
    res.status(200).json(newComment);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "An error occurred while creating comment.",
    });
  }
}
