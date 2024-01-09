/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Comment, User } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "~/server/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const comments = await prisma.comment.findMany({
      where: { tweetId: req.query.tweetId as string },
      include: {
        author: true,
      },
      orderBy: { createdAt: "desc" },
    });
    const firstXComments = comments.slice(0, Number(req.query.count));
    res.status(200).json({ data: firstXComments, total: comments.length });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching comment." });
  }
}
