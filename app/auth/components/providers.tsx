"use client";

/*
Provider definition:
- label (ex. Google)
- value (ex. google)
- logo (ex <img />) 16 by 16
*/

const config: { label: string; value: Provider; logo: React.ReactNode }[] = [
  {
    label: "Google",
    value: "google",
    logo: (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src="https://developers.google.com/static/identity/images/g-logo.png"
        width={16}
        height={16}
        alt="Google logo"
      />
    ),
  },
  {
    label: "Github",
    value: "github",
    logo: (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src="https://github.githubassets.com/assets/GitHub-Mark-ea2971cee799.png"
        width={16}
        height={16}
        alt="Github logo"
      />
    ),
  },
  
];

import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import Image from "next/image";
import { createClient } from "@/app/auth/utils/client";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Provider } from "@supabase/supabase-js";

export default function Providers({
  loading,
  setLoading,
  searchParams
}: {
  loading: string;
  setLoading: (newState: string) => void;
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const supabase = createClient();
  const next = searchParams?.next;

  return (
    <div className="flex gap-4">
      {config.map((provider) => (
        <Button
          key={provider.value}
          variant="outline"
          className="w-full"
          disabled={loading != ""}
          onClick={async () => {
            setLoading(provider.value);

            await supabase.auth.signInWithOAuth({
              provider: provider.value,
              options: {
                redirectTo: `http://localhost:3000/auth/callback${next ? `?next=${next}` : ''}`,
              },
            });
          }}
        >
          {loading == provider.value ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              {provider.logo}
              {config.length < 3 && (
                <span className="ml-2">
                  {config.length == 1 ? "Sign in with " : ""}
                  {provider.label}
                </span>
              )}
            </>
          )}
        </Button>
      ))}
    </div>
  );
}
