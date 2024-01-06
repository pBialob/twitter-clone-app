// components/Layout.tsx
import Link from "next/link";
import { SessionProvider, signIn, useSession } from "next-auth/react";
import { UserDropdownMenu } from "~/components/UserDropdownMenu";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useQuery } from "@tanstack/react-query";
import { Hashtag } from "@prisma/client";
import { useRouter } from "next/router";

export function CommandDemo() {
  const [searchTerm, setSearchTerm] = useState("");
  const [hashtags, setHashtags] = useState<Array<Hashtag>>([]);
  const router = useRouter();

  // Fetch hashtags using useQuery
  const {
    data: filteredHashtags,
    isLoading,
    isSuccess,
    isError,
  } = useQuery<Array<Hashtag>>(
    ["hashtags", searchTerm],
    () =>
      fetch(`/api/hashtags/search/${encodeURIComponent(searchTerm)}`).then(
        async (res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          if (!res.headers.get("content-type")?.includes("application/json")) {
            throw new Error("Received non-JSON response from server.");
          }
          return res.json();
        }
      ),
    {
      // This will prevent the query from automatically running on mount; it will wait for searchTerm to change
      enabled: !!searchTerm.trim(),
    }
  );

  useEffect(() => {
    if (isSuccess) {
      setHashtags(filteredHashtags as Array<Hashtag>);
    }
  }, [isSuccess, filteredHashtags]);

  return (
    <Command className="z-30  pt-1">
      <CommandInput
        className="w-full items-center justify-center text-center" // Full width of the parent
        placeholder="Wpisz hashtag do wyszukania"
        value={searchTerm}
        onValueChange={(search) => setSearchTerm(search)}
      />

      <CommandList>
        {hashtags && searchTerm && hashtags?.length === 0 && (
          <CommandEmpty>Nie znaleziono tego hashtagu</CommandEmpty>
        )}
        {hashtags &&
          searchTerm &&
          hashtags?.length > 0 &&
          hashtags.map((hashtag) => (
            <CommandItem
              className=" flex items-center justify-center gap-2 font-bold text-black"
              key={hashtag.id}
              onSelect={() => {
                router.push(`/hashtags/${hashtag.name}`);
                setSearchTerm("");
              }}
            >
              <Link
                href={`/hashtags/${hashtag.name}`}
                className="h-full w-full"
              >
                <span>{hashtag.name}</span>
              </Link>
            </CommandItem>
          ))}
      </CommandList>
    </Command>
  );
}

export default function HeaderLayout({
  children,
}: {
  children?: React.ReactNode;
}) {
  const { data: sessionData } = useSession();

  return (
    <div>
      <header className="border-base-border fixed left-0 top-0 z-10 w-full border-b bg-white">
        <nav className="flex h-[var(--navigation-height)] w-full items-center">
          <div className="flex h-full w-full items-center justify-between px-4">
            <div className="flex items-center text-lg">
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="https://png.pngtree.com/template/20190422/ourmid/pngtree-cross-plus-medical-logo-icon-design-template-image_145195.jpg"
                  width={48}
                  height={48}
                  alt={"medtalk-logo"}
                />
                <span className="text-lg font-bold text-black no-underline">
                  Medtalk
                </span>
              </Link>
              {sessionData?.user && (
                <>
                  <Link href={`/user/${sessionData?.user?.name}`}>
                    <div className="ml-12 text-black no-underline">
                      Moje posty
                    </div>
                  </Link>
                </>
              )}
            </div>
            <SessionProvider>
              <div className="flex items-center gap-4">
                {sessionData ? (
                  <UserDropdownMenu session={sessionData} />
                ) : (
                  <Button onClick={() => void signIn()}>{"Sign in"}</Button>
                )}
              </div>
            </SessionProvider>
          </div>
        </nav>
        <CommandDemo />
      </header>
      {children}
    </div>
  );
}
