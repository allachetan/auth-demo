"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import Link from "next/link";
import { createClient } from "@/app/auth/utils/client";
import ErrorMessage from "../components/error-message";

const FormSchema = z.object({
  pin: z.string().min(6, {
    message: "Your one-time password must be 6 characters.",
  }),
});

export default function Page({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const email = (searchParams?.email as string) ?? "";
  const code_type = (searchParams?.type as string) ?? "email";
  const next = searchParams?.next;

  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");

  const [countdown, setCountdown] = useState(60);
  const [isCounting, setIsCounting] = useState(true);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      pin: "",
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setLoading("verify");

    const token = data.pin;
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: code_type == "recovery" ? "recovery" : "email",
    });

    if (error) {
      if (error.status == 401) {
        // invalid code
        setError("Incorrect code");
      } else {
        setError("Unknown error");
      }

      form.reset();
      setLoading("");
      return;
    }

    if (code_type == "recovery") {
      router.push(`/auth/update-password${next ? `?next=${next}` : ''}`);
    } else {
      router.push(next as string ?? '/');
    }
  }

  useEffect(() => {
    form.setFocus("pin");
  }, [form]);

  useEffect(() => {
    let interval: any;

    if (isCounting && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((currentCountdown) => currentCountdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      setIsCounting(false);
      setCountdown(60);
    }
    return () => clearInterval(interval);
  }, [isCounting, countdown]);

  async function resendCode() {
    setLoading("resend");

    if (code_type == "recovery") {
      await supabase.auth.resetPasswordForEmail(email);
    } else {
      await supabase.auth.resend({
        type: "signup",
        email: email,
      });
    }

    setIsCounting(true);
    setLoading("");
  }

  return (
    <>
      <CardHeader className="space-y-2">
      {error && <ErrorMessage message={error} className="mb-4 -mt-2" />}
        <CardTitle className="text-xl text-center">Check your email</CardTitle>
        <CardDescription className="text-center">
          Enter the verification code sent to {email}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-6"
          >
            <FormField
              control={form.control}
              name="pin"
              render={({ field }) => (
                <FormItem className="mx-auto">
                  <FormControl>
                    <InputOTP
                      maxLength={6}
                      render={({ slots }) => (
                        <InputOTPGroup>
                          {slots.map((slot, index) => (
                            <InputOTPSlot
                              key={index}
                              {...slot}
                              className="w-12 h-12"
                            />
                          ))}{" "}
                        </InputOTPGroup>
                      )}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-between">
              <Button
                type="submit"
                disabled={loading != ""}
                className="w-full"
                size="sm"
              >
                {loading == "verify" && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Verify Code
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>

      <CardFooter className="mt-2 flex justify-between text-xs">
        <p
          className="text-blue-600 hover:cursor-pointer"
          onClick={() => {
            router.back();
          }}
        >
          Go back
        </p>

        <div className="flex items-center">
        {loading == "resend" && (
            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
          )}
        <p
          className={
            loading != "" || isCounting
              ? ""
              : "text-blue-600 hover:cursor-pointer"
          }
          onClick={resendCode}
        >
          {isCounting && `(${countdown}) `}
          Send again
        </p>
        </div>
      </CardFooter>
    </>
  );
}
