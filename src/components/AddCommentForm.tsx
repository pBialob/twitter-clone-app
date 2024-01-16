import { useSession } from "next-auth/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type Comment, type Tweet } from "@prisma/client";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../../@/components/ui/form";
import { Textarea } from "../../@/components/ui/textarea";
import { Button } from "../../@/components/ui/button";

const createComment = async (comment: Comment) =>
  await fetch(`/api/comments/create`, {
    method: "POST",
    body: JSON.stringify(comment),
  });

const formSchema = z.object({
  content: z
    .string()
    .min(2, { message: "Komentarz musi mieć przynajmniej 2 znaki" })
    .max(180, { message: "Komentarz może mieć maksymalnie 180 znaków" }),
  tweetId: z.string(),
  authorId: z.string(),
});

export const AddCommentForm = ({
  tweetToComment,
}: {
  tweetToComment: Tweet;
}) => {
  const { data: sessionData } = useSession();
  const queryClient = useQueryClient();

  const { mutateAsync: addComment } = useMutation({
    mutationFn: async (comment: Comment) => createComment(comment),
    onSuccess: async () => {
      await queryClient.invalidateQueries([
        "comments",
        "tweets",
        tweetToComment.id,
      ]);
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
      tweetId: tweetToComment?.id,
      authorId: sessionData?.user?.id,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const comment = {
      ...values,
    } as Comment;

    try {
      await addComment(comment);
    } catch (e) {
      console.log(e);
    } finally {
      form.reset();
    }
  };

  return (
    <>
      <Form {...form}>
        {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className={"flex w-full items-center justify-between gap-4"}
        >
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem className={"w-full"}>
                <FormControl className={"w-full"}>
                  <Textarea
                    placeholder="Co masz na myśli?"
                    {...field}
                    className={"resize-none text-black"}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className={" tracking-wide"}>
            Wyślij
          </Button>
        </form>
      </Form>
    </>
  );
};
