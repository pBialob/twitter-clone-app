/* eslint-disable  @typescript-eslint/no-unsafe-assignment */
import { type NextApiRequest, type NextApiResponse } from "next";
import { prisma } from "~/server/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    // Perform the delete operation
    console.log(req.query.id);
    await prisma.comment.delete({
      where: { id: req.query.id as string },
    });
    res.status(200).send({
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error(error);
    // Send a more detailed error message
    res.status(500).json({
      error: "An error occurred while deleting the comment.",

      details: error.message || error,
    });
  }
}
