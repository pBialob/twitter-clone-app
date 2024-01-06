/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/consistent-type-imports */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Hashtag, Media, Tweet, User } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import classNames from "classnames";
import { type NextPage } from "next";
import { SessionProvider, signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import HeaderLayout, { CommandDemo } from "~/layouts/Header";
import { AddTweetForm } from "~/components/AddTweetForm";
import TweetComponent from "~/components/Tweet";
import { useRouter } from "next/router";
import { useEffect } from "react";

const getTweets = async (name: string) => {
  try {
    const res = await fetch(`/api/hashtags/${name}`);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    return data as Array<
      Tweet & { author: User; hashtags: Array<Hashtag>; media: Array<Media> }
    >;
  } catch (error) {
    console.error("Fetch failed:", error);
    return [];
  }
};

const Hashtags: NextPage = () => {
  const router = useRouter();
  const { name } = router.query;

  const {
    data: tweets,
    isSuccess,
    isLoading,
  } = useQuery({
    queryKey: ["hastags", name as string, "tweets"],
    queryFn: () => getTweets(name as string),
  });
  const { data: sessionData } = useSession();

  useEffect(() => {
    console.log(tweets);
  }, [tweets]);

  return (
    <SessionProvider>
      <main className="min-h-[calc(100vh_-_var(--navigation-height)_-_4rem)]  bg-white pt-[calc(var(--navigation-height)_+_4rem)]">
        <div className="text-md flex w-full flex-col gap-14 px-14 pt-8 font-serif leading-relaxed lg:flex-row">
          {/* Tweets feed */}
          <div className="order-2 flex w-full flex-col gap-y-4 lg:order-1 lg:w-1/2">
            <h1 className="text-2xl text-gray-500">#{name}</h1>
            {isLoading && <div>Loading...</div>}
            {isSuccess &&
              tweets.map((tweet, index) => (
                <TweetComponent key={tweet.id} tweet={tweet} />
              ))}
          </div>
          {/* Add Tweet Form */}
          <div className="order-1 w-full lg:order-2 lg:w-1/3">
            {sessionData?.user && <AddTweetForm />}
          </div>
        </div>
      </main>
    </SessionProvider>
  );
};

export default Hashtags;
