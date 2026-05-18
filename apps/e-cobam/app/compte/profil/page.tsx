import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AccountPageHeader, AccountPageShell } from "@/components/account/account-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { getCustomerAccount } from "@/lib/customer-account";
import { getCustomerSession } from "@/lib/customer-auth";
import { updateCustomerProfileAction } from "../actions";

export const metadata: Metadata = {
  title: "Profil client",
  description: "Gerez votre profil e-cobam.",
};

export default async function CustomerProfilePage() {
  const session = await getCustomerSession();
  if (!session) {
    redirect("/connexion?next=/compte/profil");
  }

  const account = await getCustomerAccount(session);
  if (!account) {
    redirect("/connexion?next=/compte/profil");
  }

  return (
    <main className="commerce-container py-8 sm:py-12">
      <AccountPageHeader
        eyebrow="Profil"
        title="Vos informations."
        description="Gardez vos coordonnees a jour pour faciliter le suivi, la livraison et la facturation."
      />

      <AccountPageShell active="/compte/profil">
        <form action={updateCustomerProfileAction}>
          <Card>
            <CardHeader>
              <CardTitle>Identite du compte</CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="grid gap-4 pt-5 sm:grid-cols-2 sm:pt-6">
              <div className="space-y-2">
                <Label htmlFor="type">Type de compte</Label>
                <Select name="type" defaultValue={account.type}>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Type de compte" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INDIVIDUAL">Particulier</SelectItem>
                    <SelectItem value="COMPANY">Entreprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={account.user.email} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <Input id="firstName" name="firstName" defaultValue={account.firstName ?? ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <Input id="lastName" name="lastName" defaultValue={account.lastName ?? ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyName">Societe</Label>
                <Input
                  id="companyName"
                  name="companyName"
                  defaultValue={account.companyName ?? ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxIdentifier">Identifiant fiscal</Label>
                <Input
                  id="taxIdentifier"
                  name="taxIdentifier"
                  defaultValue={account.taxIdentifier ?? ""}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input id="phone" name="phone" type="tel" defaultValue={account.phone ?? ""} />
              </div>
            </CardContent>
            <Separator />
            <CardContent className="grid gap-3 pt-5 sm:grid-cols-2 sm:pt-6">
              <Label className="border-ec-line text-ec-ink flex min-h-16 items-center gap-3 rounded-2xl border p-4 text-sm font-semibold tracking-normal normal-case">
                <Checkbox name="emailMarketingOptIn" defaultChecked={account.emailMarketingOptIn} />
                Recevoir les offres par email
              </Label>
              <Label className="border-ec-line text-ec-ink flex min-h-16 items-center gap-3 rounded-2xl border p-4 text-sm font-semibold tracking-normal normal-case">
                <Checkbox name="smsMarketingOptIn" defaultChecked={account.smsMarketingOptIn} />
                Recevoir les suivis par SMS
              </Label>
            </CardContent>
            <CardFooter>
              <Button type="submit">Enregistrer le profil</Button>
            </CardFooter>
          </Card>
        </form>
      </AccountPageShell>
    </main>
  );
}
