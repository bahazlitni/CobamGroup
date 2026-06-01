import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getCustomerSession } from "@/lib/customer-auth";

export const metadata: Metadata = {
  title: "Profil client",
  description: "Acces au profil client e-cobam.",
};

export default async function AccountPage() {
  const session = await getCustomerSession();
  if (!session) {
    redirect("/connexion?next=/compte/profil");
  }

  redirect("/compte/profil");
}
