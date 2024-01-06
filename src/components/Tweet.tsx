import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Hashtag, Media, Tweet, User } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import classNames from "classnames";
import { formatTimeToNow } from "lib/utils";
import { MessageSquare, PencilIcon, TrashIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import React from "react";
import { useRef } from "react";
import { AddTweetForm } from "./AddTweetForm";

const deleteTweet = async (id: string) =>
  await fetch(`/api/tweets/${id}/delete`, {
    method: "DELETE",
  });

const TweetComponent = ({
  tweet,
}: {
  tweet: Tweet & {
    author: User;
    hashtags: Array<Hashtag>;
    media: Array<Media>;
  };
}) => {
  const queryClient = useQueryClient();
  const deleteTweetMutation = useMutation({
    mutationFn: async (id: string) => deleteTweet(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries(["tweets"]);
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const pRef = useRef<HTMLParagraphElement>(null);
  const { data: sessionData } = useSession();
  return (
    <div className="flex h-fit w-full rounded-md bg-white shadow">
      {/* Content Section */}
      <div
        className={classNames(
          tweet.media?.length > 0 ? "w-2/3" : "w-full",
          "h-full"
        )}
      >
        <div className="flex w-full flex-col flex-wrap justify-between px-6 py-4">
          {/* Hashtags and User Info */}
          <div className="mt-1 flex flex-wrap items-center gap-1 text-xs text-gray-500">
            {sessionData?.user?.id === tweet.authorId && (
              <>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={async () => {
                    await deleteTweetMutation.mutateAsync(tweet.id);
                    pRef.current?.classList.add("animate-pulse");
                  }}
                >
                  <TrashIcon className="h-4 w-4 stroke-red-500" />
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="icon" variant="ghost">
                      <PencilIcon className="h-4 w-4 stroke-black" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Edycja posta</DialogTitle>
                      <DialogDescription>Edytuj swój post</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <AddTweetForm tweetToUpdate={tweet} />
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            )}
            {/* Dynamic Hashtags Rendering */}
            {tweet.hashtags
              ? tweet.hashtags.map((hashtag) => (
                  <React.Fragment key={hashtag.name}>
                    <a
                      className="text-sm text-zinc-900 underline underline-offset-2"
                      href={`/hashtags/${hashtag.name}`}
                    >
                      {hashtag.name}
                    </a>
                    <span className="px-1">•</span>
                  </React.Fragment>
                ))
              : null}
            {/* User and Post Info */}
            <span>Posted by u/</span>
            <Avatar className="h-6 w-6">
              <AvatarImage src={tweet.author.image as string} />
              <AvatarFallback>{tweet.author.name.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <span>{tweet.author.name}</span>
            <span>{formatTimeToNow(new Date(tweet.createdAt))}</span>
          </div>

          {/* Tweet Title */}
          <a href="/">
            <h1 className="py-2 text-lg font-semibold leading-6 text-gray-900">
              {tweet.title}
            </h1>
          </a>

          {/* Tweet Content */}

          <span className="w-full overflow-clip text-base text-gray-900">
            {tweet.content}
          </span>
        </div>

        {/* Comments Section */}
        <div className="z-20 bg-gray-100 px-4 py-4 text-sm sm:px-6">
          <div className="flex w-fit items-center gap-2 text-black">
            <MessageSquare className="h-4 w-4" /> Komentarze
          </div>
        </div>
      </div>
      {tweet.media?.length > 0 && (
        <div className="max-h-[150px] w-1/3">
          <Carousel className="max-h-full">
            <CarouselContent className="max-h-full">
              {tweet.media.map((media) => (
                <CarouselItem
                  key={media.url}
                  className="flex max-h-full items-center justify-center"
                >
                  <img
                    src={media.url}
                    alt={media.url}
                    className="h-[150px] object-cover"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>

            {tweet.media?.length > 1 && (
              <>
                <CarouselPrevious className="text-black" />
                <CarouselNext className="text-black" />
              </>
            )}
          </Carousel>
        </div>
      )}
    </div>
  );
};

export default TweetComponent;
