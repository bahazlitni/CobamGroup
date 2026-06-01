import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MapPin, Star, Trash2 } from "lucide-react";

import { AccountPageHeader, AccountPageShell } from "@/components/account/account-shell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
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
import {
  addCustomerAddressAction,
  deleteCustomerAddressAction,
  setDefaultCustomerAddressAction,
} from "../actions";

export const metadata: Metadata = {
  title: "Adresses client",
  description: "Gerez vos adresses e-cobam.",
};

export default async function CustomerAddressesPage() {
  const session = await getCustomerSession();
  if (!session) {
    redirect("/connexion?next=/compte/adresses");
  }

  const account = await getCustomerAccount(session);
  if (!account) {
    redirect("/connexion?next=/compte/adresses");
  }

  return (
    <main className="commerce-container py-8 sm:py-12">
      <AccountPageHeader
        title="Adresses"
      />

      <AccountPageShell active="/compte/adresses">
        <div className="space-y-8">
          {account.addresses.length > 0 ? (
            <section className="grid gap-4 md:grid-cols-2">
              {account.addresses.map((address) => (
                <Card key={address.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <MapPin className="text-ec-blue size-4" />
                      {address.label || address.fullName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-ec-muted text-sm leading-7">
                      {address.addressLine1}
                      {address.addressLine2 ? `, ${address.addressLine2}` : ""}
                      <br />
                      {address.city}
                      {address.governorate ? `, ${address.governorate}` : ""}
                      {address.postalCode ? ` ${address.postalCode}` : ""}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {address.isDefaultShipping ? (
                        <Badge variant="blue">Livraison par défaut</Badge>
                      ) : null}
                      {address.isDefaultBilling ? (
                        <Badge variant="secondary">Facturation par défaut</Badge>
                      ) : null}
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-wrap gap-2">
                    <form action={setDefaultCustomerAddressAction}>
                      <input type="hidden" name="addressId" value={address.id} />
                      <input type="hidden" name="kind" value="shipping" />
                      <Button
                        type="submit"
                        variant="quiet"
                        size="sm"
                        icon={<Star className="size-4" />}
                      >
                        Livraison
                      </Button>
                    </form>
                    <form action={setDefaultCustomerAddressAction}>
                      <input type="hidden" name="addressId" value={address.id} />
                      <input type="hidden" name="kind" value="billing" />
                      <Button
                        type="submit"
                        variant="quiet"
                        size="sm"
                        icon={<Star className="size-4" />}
                      >
                        Facturation
                      </Button>
                    </form>
                    <form action={deleteCustomerAddressAction}>
                      <input type="hidden" name="addressId" value={address.id} />
                      <Button
                        type="submit"
                        variant="secondary"
                        size="sm"
                        icon={<Trash2 className="size-4" />}
                      >
                        Supprimer
                      </Button>
                    </form>
                  </CardFooter>
                </Card>
              ))}
            </section>
          ) : (
            <Alert variant="muted">
              <MapPin />
              <div>
                <AlertTitle>Aucune adresse enregistrée</AlertTitle>
              </div>
            </Alert>
          )}

          <form action={addCustomerAddressAction}>
            <Card>
              <CardHeader>
                <CardTitle>Ajouter une adresse</CardTitle>
              </CardHeader>
              <Separator />
              <CardContent className="grid gap-4 pt-5 sm:grid-cols-2 sm:pt-6">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select name="type" defaultValue="BOTH">
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Type d'adresse" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BOTH">Livraison et facturation</SelectItem>
                      <SelectItem value="SHIPPING">Livraison</SelectItem>
                      <SelectItem value="BILLING">Facturation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="label">Libellé</Label>
                  <Input id="label" name="label" placeholder="Maison, chantier, depot..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nom complet</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    required
                    defaultValue={[account.firstName, account.lastName].filter(Boolean).join(" ")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input id="phone" name="phone" type="tel" defaultValue={account.phone ?? ""} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="addressLine1">Adresse</Label>
                  <Input id="addressLine1" name="addressLine1" required />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="addressLine2">Complément</Label>
                  <Input id="addressLine2" name="addressLine2" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Ville</Label>
                  <Input id="city" name="city" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="governorate">Gouvernorat</Label>
                  <Input id="governorate" name="governorate" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Code postal</Label>
                  <Input id="postalCode" name="postalCode" />
                </div>
              </CardContent>
              <Separator />
              <CardContent className="grid gap-3 pt-5 sm:grid-cols-2 sm:pt-6">
                <Label className="border-ec-line text-ec-ink flex min-h-16 items-center gap-3 rounded-2xl border p-4 text-sm font-semibold tracking-normal normal-case">
                  <Checkbox name="isDefaultShipping" />
                  Adresse de livraison par défaut
                </Label>
                <Label className="border-ec-line text-ec-ink flex min-h-16 items-center gap-3 rounded-2xl border p-4 text-sm font-semibold tracking-normal normal-case">
                  <Checkbox name="isDefaultBilling" />
                  Adresse de facturation par défaut
                </Label>
              </CardContent>
              <CardFooter>
                <Button type="submit">Ajouter</Button>
              </CardFooter>
            </Card>
          </form>
        </div>
      </AccountPageShell>
    </main>
  );
}
