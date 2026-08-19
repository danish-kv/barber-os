"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FlaskConical, LogOut, RotateCcw, UserRoundCog, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { BottomSheet } from "@/components/shared/bottom-sheet";
import { ToneAvatar } from "@/components/shared/tone-avatar";
import { useDemoStore } from "@/lib/store";
import { PERSONAS, ROLE_ORDER } from "@/lib/personas";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

export function DemoBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-dashed border-primary/40 bg-primary/5 px-2 py-0.5 text-[11px] font-medium text-primary",
        className
      )}
    >
      <FlaskConical className="size-3" aria-hidden />
      Demo
    </span>
  );
}

export function RoleSwitcherSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const router = useRouter();
  const currentRole = useDemoStore((s) => s.session.role);
  const enterRole = useDemoStore((s) => s.enterRole);

  const choose = (role: Role) => {
    enterRole(role);
    onOpenChange(false);
    const p = PERSONAS[role];
    toast.success(`Now viewing as ${p.name}`, { description: p.title });
    router.push(p.home as "/");
  };

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Switch demo role"
      description="Jump between personas — shared demo state carries across."
    >
      <div className="grid gap-2 pb-2">
        {ROLE_ORDER.map((role) => {
          const p = PERSONAS[role];
          const active = role === currentRole;
          return (
            <button
              key={role}
              onClick={() => choose(role)}
              className={cn(
                "flex min-h-14 items-center gap-3 rounded-xl border p-3 text-left transition-colors",
                active
                  ? "border-primary bg-primary/5"
                  : "hover:bg-muted/60 active:bg-muted"
              )}
            >
              <ToneAvatar name={p.name} toneName={p.avatarTone} size="md" />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">{p.name}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {p.title}
                </span>
              </span>
              {active && <Check className="size-4 text-primary" aria-hidden />}
            </button>
          );
        })}
      </div>
    </BottomSheet>
  );
}

export function DemoMenu() {
  const router = useRouter();
  const role = useDemoStore((s) => s.session.role);
  const resetDemo = useDemoStore((s) => s.resetDemo);
  const exitDemo = useDemoStore((s) => s.exitDemo);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  const persona = role ? PERSONAS[role] : null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-9 rounded-full"
            aria-label="Demo menu"
          >
            {persona ? (
              <ToneAvatar name={persona.name} toneName={persona.avatarTone} size="sm" />
            ) : (
              <UserRoundCog className="size-5" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60">
          {persona && (
            <>
              <DropdownMenuLabel className="flex items-center gap-2">
                <ToneAvatar name={persona.name} toneName={persona.avatarTone} size="sm" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{persona.name}</span>
                  <span className="block truncate text-xs font-normal text-muted-foreground">
                    {persona.title}
                  </span>
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem onClick={() => setSwitcherOpen(true)}>
            <UserRoundCog className="size-4" />
            Switch demo role
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setResetOpen(true)}>
            <RotateCcw className="size-4" />
            Reset demo data
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              exitDemo();
              router.push("/");
            }}
          >
            <LogOut className="size-4" />
            Exit to landing page
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <RoleSwitcherSheet open={switcherOpen} onOpenChange={setSwitcherOpen} />

      <AlertDialog open={resetOpen} onOpenChange={setResetOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset demo data?</AlertDialogTitle>
            <AlertDialogDescription>
              All bookings, checkouts and changes made during this demo will be
              replaced with fresh presentation-ready seed data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                resetDemo();
                toast.success("Demo data reset", {
                  description: "Everything is back to a clean storyline.",
                });
                router.push("/demo");
              }}
            >
              Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
