/* eslint-disable @typescript-eslint/no-extra-non-null-assertion */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useSession } from "next-auth/react";
import { type Tweet, type Hashtag, Media } from "@prisma/client";
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
import { useUploadThing } from "~/utils/uploadthing";

const uploadThings = async (
  files: File[] | null,
  startUpload: (files: File[]) => Promise<
    | {
        fileUrl: string;
        fileKey: string;
      }[]
    | undefined
  >
) => {
  return (await startUpload(files!!)) as unknown as {
    fileKey: string;
    fileUrl: string;
  }[];
};

const MAX_FILE_SIZE = 4000000;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const formSchema = z.object({
  content: z
    .string()
    .min(2, { message: "Tweet musi mieć przynajmniej 2 znaki" })
    .max(180, { message: "Tweet może mieć maksymalnie 180 znaków" }),
  hashtags: z.string(),
  media: z
    .any()
    .refine((files: FileList) => {
      if (!files?.[0]) return true; // no file
      return files?.length <= 4;
    }, "Maksymalna ilość plików to 4")
    .refine((files: FileList) => {
      if (!files?.[0]) return true; // no file
      return files?.[0]?.size <= MAX_FILE_SIZE;
    }, `Maksymalny rozmiar to 5MB.`)
    .refine((files: FileList) => {
      if (!files?.[0]) return true; // no file
      return ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type);
    }, "Wymagany format .jpg, .jpeg, .png lub .webp"),
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
      media: undefined,
    },
  });

  const fileRef = form.register("media", { required: false });

  const { startUpload } = useUploadThing({ endpoint: "imageUploader" });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const media = Array.from(values.media as FileList);
    console.log(values.media);
    const uploadedMedia = await uploadThings(media, startUpload);
    const hashtags = values.hashtags
      .split(";")
      .map((hashtag) => ({ name: hashtag } as Hashtag));
    const tweet = {
      authorId: sessionData?.user?.id,
      content: values.content,
      hashtags,
      media: uploadedMedia.map(
        (media) =>
          ({
            url: media.fileUrl,
          } as Media)
      ),
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
        <FormField
          control={form.control}
          name="media"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Media</FormLabel>
              <FormControl>
                <Input
                  type={"file"}
                  {...fileRef}
                  className={"resize-none"}
                  placeholder={"Wybierz pliki"}
                  multiple
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
