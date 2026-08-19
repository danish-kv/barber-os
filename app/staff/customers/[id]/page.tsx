"use client";

import { use } from "react";
import { CustomerProfile } from "@/components/staff/customer-profile";

export default function StaffCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <CustomerProfile customerId={id} backHref="/staff/customers" />;
}
