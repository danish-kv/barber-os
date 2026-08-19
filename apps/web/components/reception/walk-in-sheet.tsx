"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Check, Plus, UserRound, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BottomSheet } from "@/components/shared/bottom-sheet";
import { ToneAvatar } from "@/components/shared/tone-avatar";
import { useDemoStore, durationForSelection, priceForSelection } from "@/lib/store";
import { ALL_SERVICES } from "@/lib/data/seed-static";
import { staffForBranch } from "@/lib/selectors";
import { inr, durationLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

export function WalkInSheet({
  open,
  onOpenChange,
  branchId,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  branchId: string;
}) {
  const data = useDemoStore((s) => s.data);
  const customers = data.customers;
  const addWalkIn = useDemoStore((s) => s.addWalkIn);

  const [query, setQuery] = useState("");
  const [customerId, setCustomerId] = useState<string | undefined>();
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [serviceIds, setServiceIds] = useState<string[]>([]);
  const [staffId, setStaffId] = useState<string | null>(null);
  const [staffChosen, setStaffChosen] = useState(false);

  const matches = useMemo(() => {
    if (query.trim().length < 2) return [];
    const q = query.toLowerCase();
    return customers
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.phone.replace(/\s/g, "").includes(q.replace(/\s/g, ""))
      )
      .slice(0, 4);
  }, [customers, query]);

  const branchStaff = staffForBranch(data, branchId, { activeOn: new Date() });
  const services = ALL_SERVICES.filter((s) => s.branchIds.includes(branchId));
  const selectedCustomer = customers.find((c) => c.id === customerId);
  const total = priceForSelection(serviceIds, []);
  const duration = durationForSelection(serviceIds, []);

  const reset = () => {
    setQuery("");
    setCustomerId(undefined);
    setNewName("");
    setNewPhone("");
    setServiceIds([]);
    setStaffId(null);
    setStaffChosen(false);
  };

  const canSubmit =
    serviceIds.length > 0 &&
    staffChosen &&
    (customerId || newName.trim().length > 1);

  const submit = () => {
    const appt = addWalkIn({
      branchId,
      customerId,
      walkInName: newName.trim() || undefined,
      walkInPhone: newPhone.trim() || undefined,
      staffId,
      serviceIds,
    });
    toast.success("Walk-in added to queue", {
      description: `#${appt.queueNumber} · estimated wait ${appt.estimatedWaitMin} min`,
    });
    reset();
    onOpenChange(false);
  };

  return (
    <BottomSheet
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) reset();
      }}
      title="Add walk-in"
      description="Customer joins the live queue immediately"
      contentClassName="sm:max-w-lg"
    >
      <div className="grid gap-5 pb-4">
        {/* Customer */}
        <div>
          <h3 className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Customer
          </h3>
          {selectedCustomer ? (
            <div className="flex items-center gap-3 rounded-xl border border-primary bg-primary/5 p-3">
              <ToneAvatar
                name={selectedCustomer.name}
                toneName={selectedCustomer.avatarTone}
                size="sm"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{selectedCustomer.name}</p>
                <p className="text-xs text-muted-foreground">{selectedCustomer.phone}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setCustomerId(undefined)}>
                Change
              </Button>
            </div>
          ) : (
            <>
              <Input
                placeholder="Search name or phone…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-11"
              />
              {matches.length > 0 && (
                <div className="mt-1.5 grid gap-1 rounded-xl border p-1.5">
                  {matches.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setCustomerId(c.id);
                        setQuery("");
                      }}
                      className="flex items-center gap-2.5 rounded-lg p-2 text-left hover:bg-muted"
                    >
                      <ToneAvatar name={c.name} toneName={c.avatarTone} size="xs" />
                      <span className="text-sm font-medium">{c.name}</span>
                      <span className="ml-auto text-xs text-muted-foreground">{c.phone}</span>
                    </button>
                  ))}
                </div>
              )}
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div className="grid gap-1">
                  <Label htmlFor="walkin-name" className="text-xs">
                    Or new customer
                  </Label>
                  <Input
                    id="walkin-name"
                    placeholder="Name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="h-10"
                  />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="walkin-phone" className="text-xs">
                    Phone (optional)
                  </Label>
                  <Input
                    id="walkin-phone"
                    type="tel"
                    inputMode="tel"
                    placeholder="+91 …"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="h-10"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Services */}
        <div>
          <h3 className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Services
          </h3>
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
                    "flex min-h-9 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "bg-card hover:bg-muted"
                  )}
                >
                  {active ? <Check className="size-3" /> : <Plus className="size-3" />}
                  {svc.name} · {inr(svc.price)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Barber */}
        <div>
          <h3 className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Barber
          </h3>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => {
                setStaffId(null);
                setStaffChosen(true);
              }}
              aria-pressed={staffChosen && staffId === null}
              className={cn(
                "flex min-h-9 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium",
                staffChosen && staffId === null
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-card hover:bg-muted"
              )}
            >
              <Zap className="size-3" aria-hidden />
              Any barber
            </button>
            {branchStaff.map((st) => {
              const active = staffChosen && staffId === st.id;
              return (
                <button
                  key={st.id}
                  onClick={() => {
                    setStaffId(st.id);
                    setStaffChosen(true);
                  }}
                  aria-pressed={active}
                  className={cn(
                    "flex min-h-9 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "bg-card hover:bg-muted"
                  )}
                >
                  <UserRound className="size-3" aria-hidden />
                  {st.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Summary + submit */}
        <div className="flex items-center justify-between rounded-xl bg-muted/60 px-4 py-3">
          <span className="text-sm text-muted-foreground">
            {serviceIds.length} service{serviceIds.length === 1 ? "" : "s"}
            {duration > 0 && ` · ${durationLabel(duration)}`}
          </span>
          <span className="font-heading text-base font-semibold">{inr(total)}</span>
        </div>
        <Button size="lg" className="h-12" disabled={!canSubmit} onClick={submit}>
          Add to queue
        </Button>
      </div>
    </BottomSheet>
  );
}
