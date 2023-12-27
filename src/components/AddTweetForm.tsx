/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useSession } from "next-auth/react";
import { Tweet, User } from "@prisma/client";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { Textarea } from "../../@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../../@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../@/components/ui/form";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const formSchema = z.object({
  content: z
    .string()
    .min(2, { message: "Tweet musi mieć przynajmniej 2 znaki" })
    .max(180, { message: "Tweet może mieć maksymalnie 180 znaków" }),
});

const createTweet = async (tweet: Tweet) =>
  await fetch("/api/tweets/create", {
    method: "POST",
    body: JSON.stringify(tweet),
  });

export const AddTweetForm = () => {
  const { data: sessionData } = useSession();
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: async (tweet: Tweet) => createTweet(tweet),
    onSuccess: async () => {
      await queryClient.invalidateQueries(["tweets"]);
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const tweet: Tweet = {
      authorId: sessionData?.user?.id,
      content: values.content,
    } as Tweet;
    try {
      await mutateAsync(tweet);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <Form {...form}>
      {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Post</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Co masz na myśli?"
                  {...field}
                  className={"resize-none"}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className={"tracking-wide"}>
          Wyślij
        </Button>
      </form>
    </Form>
  );
};
