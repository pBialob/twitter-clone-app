/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { type User, Tweet } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import HeaderLayout from "~/layouts/Header";

const getTweets = async (id: string) => {
  const response = await fetch(`/api/user/tweets/${id}`);
  const tweets = await response.json();
  return tweets as Array<
    Tweet & {
      author: User;
    }
  >;
};

const UserTweets: NextPage = () => {
  const { data: sessionData } = useSession();

  const { data: tweets, isLoading } = useQuery(
    ["user", "tweets", sessionData?.user.id as string],
    () => getTweets(sessionData?.user.id as string),
    {
      enabled: !!sessionData?.user.id,
    }
  );

  return (
    <div className="mx-auto min-h-[calc(100vh_-_var(--navigation-height))] w-full max-w-fit bg-white  px-12 pt-[var(--navigation-height)]">
      <div className="flex flex-col">
        {isLoading && <div>Loading...</div>}
        <div className="mt-40 flex justify-center">
          {tweets?.length === 0 && <h1 className="text-4xl">Brak tweetów</h1>}
        </div>
      </div>
    </div>
  );
};

export default UserTweets;
