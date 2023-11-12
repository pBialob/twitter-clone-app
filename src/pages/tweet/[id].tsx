/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { User, Tweet } from "@prisma/client";
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
  };
};

const Tweet: NextPage = () => {
  const { data: sessionData } = useSession();
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
    <HeaderLayout>
      <div className="mx-auto min-h-[calc(100vh_-_var(--navigation-height))] w-full max-w-fit bg-white  px-12 pt-[var(--navigation-height)]">
        <div className="flex flex-col">
          {isLoading && <div>Loading...</div>}
          {tweet && (
            <>
              <div>?{tweet?.content}</div>
            </>
          )}
        </div>
      </div>
    </HeaderLayout>
  );
};

export default Tweet;
