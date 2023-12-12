/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/consistent-type-imports */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Tweet, User } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import classNames from "classnames";
import { type NextPage } from "next";
import { SessionProvider, signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import HeaderLayout from "~/layouts/Header";
import { AddTweetForm } from "~/components/AddTweetForm";

const getTweets = async () => {
  try {
    const res = await fetch("/api/tweets/list");
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    return data as Array<Tweet & { author: User }>;
  } catch (error) {
    console.error("Fetch failed:", error);
    return [];
  }
};

const Home: NextPage = () => {
  const {
    data: tweets,
    isSuccess,
    isLoading,
  } = useQuery(["tweets"], getTweets);

  return (
    <SessionProvider>
      <main>
        <div className="mx-auto min-h-[calc(100vh_-_var(--navigation-height))] w-full max-w-fit bg-white  px-12 pt-[var(--navigation-height)]">
          <AddTweetForm />
          <div className="grid grid-cols-12 flex-col  gap-10 divide-y">
            {isLoading && <div>Loading...</div>}
            {isSuccess &&
              tweets.map((tweet, index) => (
                <div
                  key={tweet.id}
                  className={classNames(
                    "card",
                    index % 3 === 0 && "col-start-1 col-end-4",
                    index % 3 === 1 && "col-start-4 col-end-10",
                    index % 3 === 2 && "col-start-10 col-end-13"
                  )}
                >
                  <article className="flex flex-col gap-2 p-4 shadow-lg">
                    <div className="p-2">{tweet.content}</div>
                    <Link href={`/tweet/${tweet.id}`}>
                      <span className="font-bold">Sprawdź tweeta</span>
                    </Link>
                  </article>
                </div>
              ))}
          </div>
        </div>
      </main>
    </SessionProvider>
  );
};

export default Home;
