/* eslint-disable @typescript-eslint/no-extra-non-null-assertion */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useSession } from "next-auth/react";
import { type Tweet, type Hashtag, Media, User } from "@prisma/client";

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
  title: z
    .string()
    .min(2, { message: "Tytuł musi mieć przynajmniej 2 znaki" })
    .max(60, { message: "Tytuł może mieć maksymalnie 60 znaków" }),
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

const modifyTweet = async (updatedTweet: Tweet) => {
  const response = await fetch(`/api/tweets/${updatedTweet.id}/update`, {
    method: "PUT",
    body: JSON.stringify(updatedTweet),
  });
  const tweet = await response.json();
  return tweet as Tweet & {
    hashtags: Hashtag[];
    media: Media[];
  };
};

export const AddTweetForm = ({
  tweetToUpdate,
}: {
  tweetToUpdate?: Tweet & { hashtags: Array<Hashtag>; media: Array<Media> };
}) => {
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

  const { mutateAsync: updateTweet } = useMutation({
    mutationFn: async (updatedTweet: Tweet) => modifyTweet(updatedTweet),
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
      content: tweetToUpdate?.content ?? "",
      title: tweetToUpdate?.title ?? "",
      hashtags:
        tweetToUpdate?.hashtags.map((hashtag) => hashtag.name).join(";") ?? "",
      media: undefined,
    },
  });

  const fileRef = form.register("media", { required: false });

  const { startUpload } = useUploadThing({ endpoint: "imageUploader" });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const media = Array.from(values.media as FileList);
    const uploadedMedia = await uploadThings(media, startUpload);
    const hashtags = values.hashtags
      .split(";")
      .map((hashtag: string) => ({ name: hashtag.slice(1) } as Hashtag));
    const tweet = {
      authorId: sessionData?.user?.id,
      content: values.content,
      title: values.title,
      hashtags,
      ...(uploadedMedia?.length > 0 && {
        media: uploadedMedia.map((media) => ({ url: media.fileUrl } as Media)),
      }),
    } as unknown as Tweet;
    try {
      if (tweetToUpdate) {
        await updateTweet({
          ...tweetToUpdate,
          ...tweet,
        });
      } else await addTweet(tweet);
    } catch (e) {
      console.log(e);
    } finally {
      form.reset();
    }
  };

  return (
    <div className="wide-bleed">
      <Form {...form}>
        {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-black">Tytuł</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Tytuł"
                    {...field}
                    className={"resize-none text-black"}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-black">Napisz post</FormLabel>
                <FormControl>
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
          <div className="justify flex items-end justify-between gap-4">
            <FormField
              control={form.control}
              name="hashtags"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-black">Tagi</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="#bolglowy; #migrena;"
                      {...field}
                      className={" resize-none text-black"}
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
                <FormItem className="w-1/4">
                  <FormLabel className="text-black">Media</FormLabel>
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
          </div>
        </form>
      </Form>
    </div>
  );
};
