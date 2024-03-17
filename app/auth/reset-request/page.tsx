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
import ErrorMessage from "../components/error-message";
import { PasswordInput } from "../components/password-input";

const formSchema = z.object({
  email: z.string().email(),
});

export default function ResetRequest({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const supabase = createClient();
  const router = useRouter();
  const next = searchParams?.next;

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);

    const { data, error } = await supabase.auth.resetPasswordForEmail(
      values.email
    );

    if (error) {
      setError("Invalid email address");
      setLoading(false);
      return;
    }

    router.push(`/auth/verify-code?email=${values.email}&type=recovery${next ? `&next=${next}` : ''}`);
  }

  return (
    <>
      <CardHeader className="space-y-2">
        {error && <ErrorMessage message={error} className="mb-1" />}
        <CardTitle className="text-center text-xl">
          Reset your password
        </CardTitle>
        <CardDescription className="text-center">
          Enter your email to reset your password
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
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

            <Button type="submit" className="w-full mt-2" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send code
            </Button>
          </form>
        </Form>
      </CardContent>

      <CardFooter className="flex justify-between mt-2">
        <p
          className="text-xs text-blue-600 hover:cursor-pointer"
          onClick={() => {
            router.back();
          }}
        >
          Go back
        </p>
      </CardFooter>
    </>
  );
}
