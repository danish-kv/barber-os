"use client";

import { use } from "react";
import { CustomerProfile } from "@/components/staff/customer-profile";

export default function ShopCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <CustomerProfile
      customerId={id}
      backHref="/shop/customers"
      bookHrefBase="/shop"
    />
  );
}
