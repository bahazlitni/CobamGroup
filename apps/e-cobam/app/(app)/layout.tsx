import type { ReactNode } from "react";

import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { UndoToastProvider } from "@/components/undo/undo-toast-provider";
import { getCustomerSession } from "@/lib/customer-auth";
import { getSafeNavigationData } from "@/lib/home-data";

export default async function CommerceAppLayout({ children }: { children: ReactNode }) {
  const [navigation, customerSession] = await Promise.all([
    getSafeNavigationData(),
    getCustomerSession(),
  ]);

  return (
    <>
      <SiteHeader categories={navigation.categories} isSignedIn={customerSession !== null} />
      {children}
      <SiteFooter categories={navigation.categories} />
      <UndoToastProvider />
    </>
  );
}
