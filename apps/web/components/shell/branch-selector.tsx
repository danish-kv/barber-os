"use client";

import { Building2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDemoStore } from "@/lib/store";
import { BRANCHES } from "@/lib/data/seed-static";
import { cn } from "@/lib/utils";

/** Owner-only branch scope filter. Reactively re-scopes every owner metric. */
export function BranchSelector({ className }: { className?: string }) {
  const value = useDemoStore((s) => s.session.ownerBranchFilter);
  const setValue = useDemoStore((s) => s.setOwnerBranchFilter);

  return (
    <Select value={value} onValueChange={setValue}>
      <SelectTrigger
        size="sm"
        className={cn("h-9 gap-1.5 rounded-full border-border/70 bg-card", className)}
        aria-label="Branch filter"
      >
        <Building2 className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Branches</SelectItem>
        {BRANCHES.map((b) => (
          <SelectItem key={b.id} value={b.id}>
            {b.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
