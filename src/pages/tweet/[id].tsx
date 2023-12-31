/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import {
  type User,
  type Tweet,
  type Hashtag,
  type Media,
} from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { NextPage } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

import HeaderLayout from "~/layouts/Header";

const getTweet = async (id: string) => {
  const response = await fetch(`/api/tweets/${id}`);
  const tweet = await response.json();
  return tweet as Tweet & {
    user: User;
    hashtags: Hashtag[];
    media: Media[];
  };
};

const Tweet: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const { data: tweet, isLoading } = useQuery(
    ["restaurant", id as string],
    () => getTweet(id as string),
    {
      enabled: !!id,
    }
  );

  return (
    <div className="mx-auto min-h-[calc(100vh_-_var(--navigation-height))] w-full max-w-fit bg-white  px-12 pt-[var(--navigation-height)]">
      <div className="flex flex-col">
        {isLoading && <div>Loading...</div>}
        {tweet && (
          <>
            <div>?{tweet?.content}</div>
            {tweet?.hashtags.map((hashtag) => (
              <p key={hashtag.id}>
                {hashtag.name} {hashtag.id}
              </p>
            ))}
            {tweet?.media.map((media) => (
              <div key={media.id}>
                <img alt={media.url} src={media.url} />
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default Tweet;
