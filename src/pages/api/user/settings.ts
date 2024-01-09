import { type NextApiRequest, type NextApiResponse } from "next";
import { prisma } from "~/server/db";
import { type Hashtag, Media, type Tweet, User } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PATCH")
    return res.status(405).json({ error: "Method not allowed" });
  const { id, name, dateOfBirth, language } = JSON.parse(
    req.body as string
  ) as User;

  try {
    const updatedUser: User = await prisma.user.update({
      where: {
        id: id,
      },
      data: {
        name,
        dateOfBirth,
        language,
      },
    });
    res.status(200).json(updatedUser);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "An error occurred while creating tweet.",
    });
  }
}
