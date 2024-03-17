"use client";

import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import Link from "next/link";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { createClient } from "@/app/auth/utils/client";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import ErrorMessage from "../components/error-message";
import { PasswordInput } from "../components/password-input";
import Providers from "../components/providers";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4),
});

export default function SignIn({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const supabase = createClient();
  const router = useRouter();
  const next = searchParams?.next;

  const [error, setError] = useState(searchParams?.error ? "Error signing in with social provider" : "");
  const [loading, setLoading] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading("submit");

    const { data, error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error) {
      if (error.message.includes("Email not confirmed")) {
        await supabase.auth.resend({
          type: "signup",
          email: values.email,
        });

        router.push(`/auth/verify-code?email=${values.email}${next ? `&next=${next}` : ''}`);
      } else if (error.message.includes("Invalid login credentials")) {
        setError("Invalid credentials");
      } else {
        setError("Unknown error");
      }
      setLoading("");
      return;
    }

    router.push(next as string ?? '/');
  }

  return (
    <>
      <CardHeader className="space-y-2">
        {error && <ErrorMessage message={error} className="mb-4 -mt-2" />}
        <CardTitle className="text-center text-xl">Sign in to Demo</CardTitle>
        <CardDescription className="text-center">
          Welcome back! Please sign in to continue
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Providers loading={loading} setLoading={setLoading} searchParams={searchParams}/>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">or</span>
          </div>
        </div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email address</FormLabel>
                  <FormControl>
                    <Input placeholder="johndoe@gmail.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>

                  <FormControl>
                    <PasswordInput {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full mt-2"
              disabled={loading != ""}
            >
              {loading == "submit" && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Sign in
            </Button>
          </form>
        </Form>
      </CardContent>

      <CardFooter className="flex justify-between mt-2">
        <p className="text-xs">
          No account?{" "}
          <Link href={`/auth/sign-up${next ? `?next=${next}` : ''}`} className="text-blue-600">
            Sign up
          </Link>
        </p>

        <Link href={`/auth/reset-request${next ? `?next=${next}` : ''}`} className="text-blue-600 text-xs">
          Forgot password
        </Link>
      </CardFooter>
    </>
  );
}
