"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useDemoStore } from "@/lib/store";
import { PERSONAS } from "@/lib/personas";

export default function LoginPage() {
  const router = useRouter();
  const enterRole = useDemoStore((s) => s.enterRole);
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulated auth — demo sessions only.
    setTimeout(() => {
      enterRole("owner");
      toast.success("Welcome back, Vikram", {
        description: "Signed in to Royal Cuts (simulated)",
      });
      router.push(PERSONAS.owner.home as "/");
    }, 700);
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-14">
      <div className="flex flex-col items-center text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-sidebar text-sidebar-primary">
          <Scissors className="size-6" aria-hidden />
        </span>
        <h1 className="mt-4 font-heading text-2xl font-semibold tracking-tight">
          Welcome back
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign in to your shop&apos;s workspace
        </p>
      </div>

      <form onSubmit={submit} className="mt-8 grid gap-4">
        <div className="grid gap-1.5">
          <Label htmlFor="phone">Phone number</Label>
          <Input
            id="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+91 98470 00000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className="h-11"
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            required
            className="h-11"
          />
        </div>
        <Button type="submit" size="lg" className="mt-1 h-11" disabled={loading}>
          {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
          {loading ? "Signing in…" : "Sign in"}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          Demo environment — any credentials sign you in as the shop owner.
        </p>
      </form>

      <div className="my-6 flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">or</span>
        <Separator className="flex-1" />
      </div>

      <Button variant="outline" size="lg" className="h-11" asChild>
        <Link href="/demo">Explore the demo without an account</Link>
      </Button>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        New shop?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
