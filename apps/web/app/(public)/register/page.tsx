"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulated registration — routes into the onboarding wizard.
    setTimeout(() => {
      toast.success("Account created (simulated)", {
        description: "Let's set up your shop.",
      });
      router.push("/onboarding");
    }, 700);
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-14">
      <div className="flex flex-col items-center text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-sidebar text-sidebar-primary">
          <Scissors className="size-6" aria-hidden />
        </span>
        <h1 className="mt-4 font-heading text-2xl font-semibold tracking-tight">
          Create your shop account
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Free for one barber. Set up in under an hour.
        </p>
      </div>

      <form onSubmit={submit} className="mt-8 grid gap-4">
        <div className="grid gap-1.5">
          <Label htmlFor="name">Your name</Label>
          <Input id="name" autoComplete="name" placeholder="Vikram Menon" required className="h-11" />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="shop">Shop name</Label>
          <Input id="shop" placeholder="Royal Cuts" required className="h-11" />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="phone">Phone number</Label>
          <Input
            id="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+91 98470 00000"
            required
            className="h-11"
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" autoComplete="new-password" required className="h-11" />
        </div>
        <Button type="submit" size="lg" className="mt-1 h-11" disabled={loading}>
          {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
          {loading ? "Creating account…" : "Create account & set up shop"}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          Demo environment — no real account is created.
        </p>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
