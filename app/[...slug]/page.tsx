"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/app/auth/utils/client";
import { useRouter } from "next/navigation";

export default function Home({
  params,
  searchParams,
}: {
  params: { slug: string[] };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const supabase = createClient();
  const router = useRouter();

  return (
    <div className="flex flex-col justify-center items-center w-screen h-screen">
      <Button
        variant="destructive"
        onClick={async () => {
          const { error } = await supabase.auth.signOut();
          router.push("/auth/sign-in");
        }}
      >
        Logout
      </Button>
    </div>
  );
}
