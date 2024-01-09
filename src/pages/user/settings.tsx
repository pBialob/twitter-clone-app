/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { cn } from "@/lib/utils";

import { type User, Tweet } from "@prisma/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import HeaderLayout from "~/layouts/Header";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import ReactCountryFlag from "react-country-flag";
import { toast } from "sonner";

const UserSettings: NextPage = () => {
  const { data: sessionData } = useSession();

  const { data: user, isLoading } = useQuery({
    queryKey: ["user", sessionData?.user.id as string],
    queryFn: () =>
      fetch(`/api/user/${sessionData?.user.id}`).then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        if (!res.headers.get("content-type")?.includes("application/json")) {
          throw new Error("Received non-JSON response from server.");
        }
        return res.json();
      }),
    enabled: !!sessionData?.user.id,
  });

  return (
    <div className="mx-auto  min-h-[calc(100vh_-_var(--navigation-height)_-_4rem)] max-w-2xl bg-white pt-[calc(var(--navigation-height)_+_4rem)]">
      <AccountForm user={user as User} />
    </div>
  );
};

export default UserSettings;

const languages = [
  { label: "Wielka Brytania", value: "gb" },
  { label: "Francja", value: "fr" },
  { label: "Niemcy", value: "de" },
  { label: "Hiszpania", value: "es" },
  { label: "Portugalia", value: "pt" },
  { label: "Rosja", value: "ru" },
  { label: "Polska", value: "pl" },
] as const;

const accountFormSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Name must be at least 2 characters.",
    })
    .max(30, {
      message: "Name must not be longer than 30 characters.",
    }),
  dateOfBirth: z.date({
    required_error: "A date of birth is required.",
  }),
  language: z.string({
    required_error: "Please select a language.",
  }),
});

type AccountFormValues = z.infer<typeof accountFormSchema>;

// This can come from your database or API.
const defaultValues: Partial<AccountFormValues> = {
  // name: "Your name",
  // dob: new Date("2023-01-23"),
};

const updateSettings = async (user: User) =>
  await fetch("/api/user/settings", {
    method: "PATCH",
    body: JSON.stringify(user),
  });

export function AccountForm({ user }: { user?: User }) {
  console.log(user);
  const defaultValues: Partial<AccountFormValues> = {
    name: user?.name,
    dateOfBirth: user?.dateOfBirth,
    language: user?.language,
  };

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues,
  });
  const queryClient = useQueryClient();

  const onSubmit = async (data: AccountFormValues) => {
    if (user === undefined) return;
    const updatedUser: User = {
      ...user,
      name: data.name,
      dateOfBirth: data.dateOfBirth,
      language: data.language,
    };

    try {
      await updateSettings(updatedUser).finally(() => {
        void queryClient.invalidateQueries(["user", updatedUser.id as string], {
          exact: true,
        });
        toast.success("Ustawienia zostały zaktualizowane.");
      });
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nazwa użytkownika</FormLabel>
              <FormControl>
                <Input placeholder="Twoja nazwa użytkownika" {...field} />
              </FormControl>
              <FormDescription>
                To jest nazwa, która będzie wyświetlana na Twoim profilu i w
                tweetach.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dateOfBirth"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data urodzenia</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Wybierz date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                Twoja data urodzenia jest używana do obliczenia Twojego wieku.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="language"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Kraj pochodzenia</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-[200px] justify-between",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <ReactCountryFlag
                        countryCode={field.value}
                        svg
                        style={{
                          width: "2em",
                          height: "1.2em",
                        }}
                        title="US"
                      />
                      {field.value
                        ? languages.find(
                            (language) => language.value === field.value
                          )?.label
                        : "Wybierz kraj"}
                      <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput placeholder="Search language..." />
                    <CommandEmpty>Nie znaleziono państwa.</CommandEmpty>
                    <CommandGroup>
                      {languages.map((language) => (
                        <CommandItem
                          value={language.label}
                          key={language.value}
                          onSelect={() => {
                            form.setValue("language", language.value);
                          }}
                          className="flex items-center gap-2"
                        >
                          <CheckIcon
                            className={cn(
                              "mr-2 h-4 w-4",
                              language.value === field.value
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          <ReactCountryFlag
                            countryCode={language.value}
                            svg
                            style={{
                              width: "2em",
                              height: "1.2em",
                            }}
                            title="US"
                          />
                          {language.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormDescription>
                To jest kraj pochodzenia, który będzie wyświetlany na Twoim
                profilu.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Update account</Button>
      </form>
    </Form>
  );
}
