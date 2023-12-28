/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useSession } from "next-auth/react";
import { type Tweet, type Hashtag } from "@prisma/client";
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
import { Input } from "../../@/components/ui/input";

const formSchema = z.object({
  content: z
    .string()
    .min(2, { message: "Tweet musi mieć przynajmniej 2 znaki" })
    .max(180, { message: "Tweet może mieć maksymalnie 180 znaków" }),
  hashtags: z.string(),
});

const createTweet = async (tweet: Tweet) =>
  await fetch("/api/tweets/create", {
    method: "POST",
    body: JSON.stringify(tweet),
  });

export const AddTweetForm = () => {
  const { data: sessionData } = useSession();
  const queryClient = useQueryClient();
  const { mutateAsync: addTweet } = useMutation({
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
      hashtags: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const hashtags = values.hashtags
      .split(";")
      .map((hashtag) => ({ name: hashtag } as Hashtag));
    const tweet = {
      authorId: sessionData?.user?.id,
      content: values.content,
      hashtags,
    } as unknown as Tweet;
    try {
      await addTweet(tweet);
    } catch (e) {
      console.log(e);
    } finally {
      form.reset();
    }
  };

  return (
    <Form {...form}>
      {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Napisz post</FormLabel>
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
        <FormField
          control={form.control}
          name="hashtags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tagi</FormLabel>
              <FormControl>
                <Input
                  placeholder="#bolglowy; #migrena;"
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
