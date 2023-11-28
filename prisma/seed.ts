/* eslint-disable @typescript-eslint/no-misused-promises */

import { prisma } from "~/server/db";

async function main() {
  // // Seeding tweets
  // const tweets = [
  //   { content: "Hello World!", authorId: "id_of_alice" }, // Replace with actual user IDs
  //   { content: "Prisma is awesome!", authorId: "id_of_bob" },
  //   // Add more tweets as needed
  // ];
  // for (const tweet of tweets) {
  //   await prisma.tweet.create({ data: tweet });
  // }
  // // Seeding comments
  // const comments = [
  //   { content: "Nice tweet!", tweetId: "id_of_tweet1", authorId: "id_of_bob" },
  //   { content: "I agree!", tweetId: "id_of_tweet2", authorId: "id_of_alice" },
  //   // Add more comments as needed
  // ];
  // for (const comment of comments) {
  //   await prisma.comment.create({ data: comment });
  // }
  // // Seeding media
  // const media = [
  //   { url: "https://example.com/image1.jpg", tweetId: "id_of_tweet1" },
  //   { url: "https://example.com/image2.jpg", tweetId: "id_of_tweet2" },
  //   // Add more media as needed
  // ];
  // for (const medium of media) {
  //   await prisma.media.create({ data: medium });
  // }
}

main()
  .catch((e: Error) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    await prisma.$disconnect();
  });
