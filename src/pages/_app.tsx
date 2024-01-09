/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import HeaderLayout from "~/layouts/Header";
import "../../app/globals.css";
import { Toaster } from "sonner";

const queryClient = new QueryClient();

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        <HeaderLayout>
          <>
            <Component {...pageProps} />
            <Toaster />
          </>
        </HeaderLayout>
      </QueryClientProvider>
    </SessionProvider>
  );
};

export default MyApp;
