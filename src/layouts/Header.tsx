/* eslint-disable @typescript-eslint/restrict-template-expressions */
// components/Layout.tsx
import Link from "next/link";
import { SessionProvider, signIn, signOut, useSession } from "next-auth/react";
import { UserDropdownMenu } from "~/components/UserDropdownMenu";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function HeaderLayout({
  children,
}: {
  children?: React.ReactNode;
}) {
  const { data: sessionData } = useSession();

  return (
    <div>
      <header className="border-base-border fixed left-0 top-0 z-10 w-full border-b ">
        <nav className="flex h-[var(--navigation-height)] w-full">
          <div className="flex h-full w-full items-center  justify-between px-4">
            <div className="flex items-center  text-lg">
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="https://png.pngtree.com/template/20190422/ourmid/pngtree-cross-plus-medical-logo-icon-design-template-image_145195.jpg"
                  width={48}
                  height={48}
                  alt={"medtalk-logo"}
                  className=""
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
      </header>

      {children}
    </div>
  );
}
