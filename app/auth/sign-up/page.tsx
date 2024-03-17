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
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { PasswordInput } from "../components/password-input";
import ErrorMessage from "../components/error-message";
import Providers from "../components/providers";

const formSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
  })
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword != password) {
      ctx.addIssue({
        code: "custom",
        message: "The passwords did not match",
        path: ["confirmPassword"],
      });
    }
  });

export default function SignUp({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const supabase = createClient();
  const router = useRouter();
  const next = searchParams?.next;

  const [error, setError] = useState("");
  const [loading, setLoading] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading("submit");

    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
    });

    if (error) {
      setError("Unknown error");

      setLoading("");
      return;
    }

    router.push(`/auth/verify-code?email=${values.email}${next ? `&next=${next}` : ''}`);
  }

  return (
    <>
      <CardHeader className="space-y-2">
        {error && <ErrorMessage message={error} className="mb-4 -mt-2" />}
        <CardTitle className="text-center text-xl">
          Create your account
        </CardTitle>
        <CardDescription className="text-center">
          Welcome! Please sign up to continue
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Providers loading={loading} setLoading={setLoading} searchParams={searchParams}/>
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
                    <Input {...field} type="password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm password</FormLabel>
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
              Sign up
            </Button>
          </form>
        </Form>
      </CardContent>

      <CardFooter className="mt-2">
        <p className="text-xs">
          Have an account?{" "}
          <Link href={`/auth/sign-in${next ? `?next=${next}` : ''}`} className="text-blue-600">
            Sign In
          </Link>
        </p>
      </CardFooter>
    </>
  );
}
