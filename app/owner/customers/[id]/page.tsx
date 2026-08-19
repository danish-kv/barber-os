"use client";

import { use } from "react";
import { CustomerProfile } from "@/components/staff/customer-profile";

export default function OwnerCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <div className="mx-auto max-w-2xl">
      <CustomerProfile customerId={id} backHref="/owner/customers" />
    </div>
  );
}
