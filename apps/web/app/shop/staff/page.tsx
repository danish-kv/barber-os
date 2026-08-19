"use client";

// Staff for small shops: roles are capabilities, not people. Owner·Barber is
// one person; temporary staff have contract windows; managed staff need no
// app login. Includes the seasonal-staff quick action (Demo V1.1 §12/§37).

import { useState } from "react";
import { addDays, format } from "date-fns";
import { toast } from "sonner";
import { CalendarClock, Check, Plus, Send, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BottomSheet } from "@/components/shared/bottom-sheet";
import { ToneAvatar } from "@/components/shared/tone-avatar";
import { useDemoStore } from "@/lib/store";
import { isStaffActiveOn, staffForBranch } from "@/lib/selectors";
import { ALL_SERVICES } from "@/lib/data/seed-static";
import type { EmploymentType, Staff } from "@/lib/types";
import { cn } from "@/lib/utils";

const SEASON_PRESETS = [
  { id: "onam", label: "Onam Rush", days: 25 },
  { id: "eid", label: "Eid Rush", days: 10 },
  { id: "wedding", label: "Wedding Season", days: 45 },
  { id: "weekend", label: "Weekend Support", days: 2 },
  { id: "custom", label: "Custom", days: 14 },
] as const;

export default function ShopStaffPage() {
  const data = useDemoStore((s) => s.data);
  const addStaff = useDemoStore((s) => s.addStaff);
  const inviteStaffToApp = useDemoStore((s) => s.inviteStaffToApp);
  const reactivateStaff = useDemoStore((s) => s.reactivateStaff);

  const [addOpen, setAddOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);

  // form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [employment, setEmployment] = useState<EmploymentType>("temporary");
  const [preset, setPreset] = useState<(typeof SEASON_PRESETS)[number]["id"]>("onam");
  const [from, setFrom] = useState(format(new Date(), "yyyy-MM-dd"));
  const [days, setDays] = useState(25);
  const [serviceIds, setServiceIds] = useState<string[]>([]);
  const [appAccess, setAppAccess] = useState(false);

  const roster = staffForBranch(data, data.branchId, { includeInactive: true });
  const services = ALL_SERVICES.filter((s) => s.branchIds.includes(data.branchId));
  const detail = roster.find((s) => s.id === detailId);
  const now = new Date();

  const chips = (s: Staff) => {
    const parts = s.title.includes("Owner")
      ? ["Owner", "Barber"]
      : [s.role === "senior-barber" ? "Senior Barber" : s.role === "stylist" ? "Stylist" : "Barber"];
    if (s.employmentType === "temporary") parts.push("Temporary");
    if (s.employmentType === "contract") parts.push("Contract");
    return parts;
  };

  const resetForm = () => {
    setName("");
    setPhone("");
    setEmployment("temporary");
    setPreset("onam");
    setFrom(format(new Date(), "yyyy-MM-dd"));
    setDays(25);
    setServiceIds([]);
    setAppAccess(false);
  };

  const submit = () => {
    if (!name.trim() || serviceIds.length === 0) {
      toast.error("Add a name and at least one service");
      return;
    }
    const id = `st_new_${Date.now().toString(36)}`;
    const activeUntil = format(addDays(new Date(from), days), "yyyy-MM-dd");
    const staff: Staff = {
      id,
      userId: `user_${id}`,
      branchId: data.branchId,
      name: name.trim(),
      role: "barber",
      title: employment === "temporary" ? "Temporary Barber" : "Barber",
      phone: phone.trim(),
      avatarTone: "gold",
      experienceYears: 2,
      serviceIds,
      rating: 4.5,
      ratingCount: 0,
      workingHours: [0, 1, 2, 3, 4, 5, 6].map((day) => ({
        day,
        start: "09:00",
        end: "20:30",
        off: false,
      })),
      commissionRules: [{ serviceCategory: "default", rate: 0.45 }],
      color: "gold",
      joinedAt: new Date().toISOString(),
      employmentType: employment,
      accessType: appAccess ? "app_user" : "managed_by_shop",
      ...(employment !== "permanent"
        ? { activeFrom: from, activeUntil }
        : {}),
    };
    addStaff(staff);
    toast.success(`${staff.name} added`, {
      description:
        employment === "permanent"
          ? "Permanent staff — appears in schedule and availability."
          : `${format(new Date(from), "d MMM")} – ${format(new Date(activeUntil), "d MMM")} · capacity increased.`,
    });
    resetForm();
    setAddOpen(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Staff</h1>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="size-4" aria-hidden />
          Add staff
        </Button>
      </div>

      {/* Seasonal quick action */}
      <button
        onClick={() => {
          setEmployment("temporary");
          setAddOpen(true);
        }}
        className="flex w-full items-center gap-3 rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-4 text-left"
      >
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
          <CalendarClock className="size-5 text-primary" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold">Add seasonal staff</span>
          <span className="block text-xs text-muted-foreground">
            Extra hands for festival or peak-season demand.
          </span>
        </span>
      </button>

      {/* Roster */}
      <ul className="grid gap-2">
        {roster.map((s) => {
          const active = isStaffActiveOn(s, now);
          const temp = s.employmentType === "temporary" || s.employmentType === "contract";
          return (
            <li key={s.id}>
              <button
                onClick={() => setDetailId(s.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl border bg-card p-4 text-left transition-colors hover:bg-muted/40",
                  temp && !active && "opacity-70"
                )}
              >
                <ToneAvatar name={s.name} toneName={s.avatarTone} size="md" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">{s.name}</span>
                  <span className="mt-0.5 flex flex-wrap gap-1">
                    {chips(s).map((chip) => (
                      <span
                        key={chip}
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-medium",
                          chip === "Owner"
                            ? "bg-accent text-accent-foreground"
                            : chip === "Temporary" || chip === "Contract"
                              ? "bg-warning/15 text-warning-foreground dark:text-warning"
                              : "bg-muted text-muted-foreground"
                        )}
                      >
                        {chip}
                      </span>
                    ))}
                  </span>
                  {temp && s.activeFrom && s.activeUntil && (
                    <span className="mt-1 block text-[11px] text-muted-foreground">
                      {format(new Date(s.activeFrom), "d MMM")} –{" "}
                      {format(new Date(s.activeUntil), "d MMM")}
                    </span>
                  )}
                </span>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase",
                    active
                      ? "bg-success/10 text-success"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {active ? "Active" : "Ended"}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* Add staff sheet */}
      <BottomSheet
        open={addOpen}
        onOpenChange={(o) => {
          setAddOpen(o);
          if (!o) resetForm();
        }}
        title="Add staff"
        contentClassName="sm:max-w-lg"
      >
        <div className="grid gap-4 pb-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="grid gap-1.5">
              <Label htmlFor="st-name">Name</Label>
              <Input
                id="st-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nabeel"
                className="h-11"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="st-phone">Phone (optional)</Label>
              <Input
                id="st-phone"
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 …"
                className="h-11"
              />
            </div>
          </div>

          <div>
            <Label className="mb-1.5 block">Employment</Label>
            <div className="grid grid-cols-3 gap-1.5">
              {(
                [
                  ["permanent", "Permanent"],
                  ["temporary", "Temporary"],
                  ["contract", "Contract"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setEmployment(id)}
                  aria-pressed={employment === id}
                  className={cn(
                    "min-h-11 rounded-xl border text-sm font-medium",
                    employment === id
                      ? "border-primary bg-primary text-primary-foreground"
                      : "bg-card"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {employment !== "permanent" && (
            <>
              <div>
                <Label className="mb-1.5 block">Season</Label>
                <div className="flex flex-wrap gap-1.5">
                  {SEASON_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setPreset(p.id);
                        setDays(p.days);
                      }}
                      aria-pressed={preset === p.id}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-medium",
                        preset === p.id
                          ? "border-primary bg-primary text-primary-foreground"
                          : "bg-card"
                      )}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="grid gap-1.5">
                  <Label htmlFor="st-from">Start date</Label>
                  <Input
                    id="st-from"
                    type="date"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className="h-11"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="st-days">Days</Label>
                  <Input
                    id="st-days"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    value={days}
                    onChange={(e) => setDays(Math.max(1, Number(e.target.value) || 1))}
                    className="h-11"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <Label className="mb-1.5 block">Services</Label>
            <div className="flex flex-wrap gap-1.5">
              {services.map((svc) => {
                const active = serviceIds.includes(svc.id);
                return (
                  <button
                    key={svc.id}
                    onClick={() =>
                      setServiceIds((prev) =>
                        active ? prev.filter((x) => x !== svc.id) : [...prev, svc.id]
                      )
                    }
                    aria-pressed={active}
                    className={cn(
                      "flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "bg-card"
                    )}
                  >
                    {active && <Check className="size-3" />}
                    {svc.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <Label className="mb-1.5 block">App access</Label>
            <div className="grid gap-1.5">
              <button
                onClick={() => setAppAccess(false)}
                aria-pressed={!appAccess}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl border p-3 text-left text-sm",
                  !appAccess && "border-primary bg-primary/5 ring-1 ring-primary"
                )}
              >
                <UserRound className="size-4 shrink-0" aria-hidden />
                <span>
                  <span className="block font-medium">Manage from my account</span>
                  <span className="block text-xs text-muted-foreground">
                    No login needed — you assign their appointments.
                  </span>
                </span>
              </button>
              <button
                onClick={() => setAppAccess(true)}
                aria-pressed={appAccess}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl border p-3 text-left text-sm",
                  appAccess && "border-primary bg-primary/5 ring-1 ring-primary"
                )}
              >
                <Send className="size-4 shrink-0" aria-hidden />
                <span>
                  <span className="block font-medium">Give staff app access</span>
                  <span className="block text-xs text-muted-foreground">
                    They get their own schedule and queue (invite simulated).
                  </span>
                </span>
              </button>
            </div>
          </div>

          <Button size="lg" className="h-12" onClick={submit}>
            {employment === "temporary" ? "Add temporary barber" : "Add staff"}
          </Button>
        </div>
      </BottomSheet>

      {/* Staff detail sheet */}
      <BottomSheet
        open={detail !== undefined && detailId !== null}
        onOpenChange={(o) => !o && setDetailId(null)}
        title={detail?.name ?? "Staff"}
      >
        {detail && (
          <div className="grid gap-4 pb-4">
            <div className="flex items-center gap-3">
              <ToneAvatar name={detail.name} toneName={detail.avatarTone} size="lg" />
              <div>
                <p className="flex flex-wrap gap-1">
                  {chips(detail).map((chip) => (
                    <span
                      key={chip}
                      className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                    >
                      {chip}
                    </span>
                  ))}
                </p>
                {detail.activeFrom && detail.activeUntil && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {format(new Date(detail.activeFrom), "d MMM")} –{" "}
                    {format(new Date(detail.activeUntil), "d MMM")}
                  </p>
                )}
              </div>
            </div>

            {/* Expired contract */}
            {(detail.employmentType === "temporary" ||
              detail.employmentType === "contract") &&
              !isStaffActiveOn(detail, now) && (
                <div className="rounded-xl border border-warning/40 bg-warning/5 p-3">
                  <p className="text-sm font-medium">Seasonal contract ended</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    History, revenue and commission stay on record.
                  </p>
                  <Button
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      reactivateStaff(
                        detail.id,
                        format(addDays(now, 14), "yyyy-MM-dd")
                      );
                      toast.success(`${detail.name} reactivated for 2 weeks`);
                    }}
                  >
                    Reactivate
                  </Button>
                </div>
              )}

            <div>
              <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                Services
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {detail.serviceIds.map((id) => (
                  <span
                    key={id}
                    className="rounded-full border bg-card px-2.5 py-1 text-xs"
                  >
                    {ALL_SERVICES.find((s) => s.id === id)?.name ?? id}
                  </span>
                ))}
              </div>
            </div>

            {/* App access */}
            <div className="rounded-xl border p-3.5">
              <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                App access
              </p>
              {detail.accessType === "managed_by_shop" ? (
                detail.inviteStatus === "pending" ? (
                  <p className="mt-1.5 text-sm">
                    <span className="font-medium text-info">Invitation pending</span>
                    <span className="block text-xs text-muted-foreground">
                      Simulated — no real SMS/OTP is sent in the demo.
                    </span>
                  </p>
                ) : (
                  <>
                    <p className="mt-1.5 text-sm font-medium">Not enabled</p>
                    <p className="text-xs text-muted-foreground">
                      {detail.name} is managed by the shop owner — appointments,
                      queue and checkout all work without their own login.
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2"
                      onClick={() => {
                        inviteStaffToApp(detail.id);
                        toast.success("Invite simulated", {
                          description: "Status: invitation pending.",
                        });
                      }}
                    >
                      <Send className="size-3.5" aria-hidden />
                      Invite to app
                    </Button>
                  </>
                )
              ) : (
                <p className="mt-1.5 text-sm font-medium text-success">Enabled</p>
              )}
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
