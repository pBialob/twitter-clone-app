import { Comment, type Tweet, User } from "@prisma/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageSquare, TrashIcon } from "lucide-react";
import { AddCommentForm } from "~/components/AddCommentForm";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../@/components/ui/avatar";
import { formatTimeToNow } from "../../lib/utils";
import React, { useState } from "react";
import { useSession } from "next-auth/react";
import classNames from "classnames";
import { Button } from "../../@/components/ui/button";
import { toast } from "sonner";

type CommentsApiResponse = {
  data: Array<
    Comment & {
      author: User;
    }
  >;
  total: number;
};
const getComments = async (tweetId: string, count: number) => {
  try {
    const res = await fetch(
      `/api/comments/list?tweetId=${tweetId}&count=${count}`,
      {
        method: "GET",
      }
    );
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    return data as CommentsApiResponse;
  } catch (error) {
    console.error("Fetch failed:", error);
    return { data: [], total: 0 };
  }
};

const deleteComment = async (id: string) =>
  await fetch(`/api/comments/${id}/delete`, {
    method: "DELETE",
  });
export const CommentsSection = ({ tweet }: { tweet: Tweet }) => {
  const queryClient = useQueryClient();
  const [count, setCount] = useState(3);
  const { data: sessionData } = useSession();
  const {
    data: comments,
    isSuccess,
    isLoading,
  } = useQuery({
    queryKey: ["comments", "tweets", tweet.id, count],
    queryFn: async () => getComments(tweet.id, count),
    keepPreviousData: true,
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => deleteComment(commentId),
    onSuccess: async () => {
      toast.success("Komentarz został usunięty.");
      await queryClient.invalidateQueries(["comments", "tweets", tweet.id]);
    },
    onError: (error) => {
      toast.error("Wystąpił błąd podczas usuwania komentarza.");
      console.log(error);
    },
  });

  const handleExpand = () => {
    setCount(count + 3);
  };

  const handleCollapse = () => {
    setCount(3);
  };

  return (
    <div className=" w-full bg-gray-100 px-4 py-4 text-sm sm:px-6">
      <div className="flex w-full flex-col gap-2 text-black">
        <div className={"flex w-full flex-row items-center gap-2"}>
          <MessageSquare className="h-4 w-4" /> Komentarze
        </div>
        {sessionData?.user.id && (
          <div className={"flex w-full"}>
            <AddCommentForm tweetToComment={tweet} />
          </div>
        )}
        {isLoading && <div>Loading...</div>}
        {comments && comments.data.length > 0 && (
          <>
            <div
              className={
                "flex w-full flex-col gap-2 rounded-md bg-white p-2 shadow-sm"
              }
            >
              {comments.data.map((comment, index) => (
                <div
                  key={comment.id}
                  className={classNames("flex w-full flex-col gap-2 p-2 pt-0", {
                    "border-b": index !== comments.data.length - 1,
                  })}
                >
                  <div
                    className={
                      "flex w-full flex-row items-center gap-2 text-xs text-gray-500"
                    }
                  >
                    <span>Posted by u/</span>
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={comment.author.image as string} />
                      <AvatarFallback>
                        {comment.author.name.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <span>{comment.author.name}</span>
                    <span>{formatTimeToNow(new Date(comment.createdAt))}</span>
                    {comment.author.id === sessionData?.user.id && (
                      <Button
                        className={"ml-auto"}
                        size="icon"
                        variant="ghost"
                        onClick={async () =>
                          await deleteCommentMutation.mutateAsync(comment.id)
                        }
                      >
                        <TrashIcon className="h-4 w-4 stroke-red-500" />
                      </Button>
                    )}
                  </div>
                  <span className="w-full overflow-clip text-base text-gray-900">
                    {comment.content}
                  </span>
                </div>
              ))}
            </div>
            {comments.total > count && (
              <div className={"flex w-full justify-center"}>
                <Button
                  onClick={handleExpand}
                  className={
                    "w-fit self-center bg-white text-gray-900 shadow-sm hover:bg-gray-100"
                  }
                >
                  Więcej
                </Button>
              </div>
            )}
            {comments.total <= count && (
              <div className={"flex w-full justify-center"}>
                <Button
                  onClick={handleCollapse}
                  className={
                    "w-fit self-center bg-white text-gray-900 shadow-sm hover:bg-gray-100"
                  }
                >
                  Zwiń
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
