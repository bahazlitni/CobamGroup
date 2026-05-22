import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CreditCard, Star, Trash2 } from "lucide-react";

import { AccountPageHeader, AccountPageShell } from "@/components/account/account-shell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { paymentMethodLabels } from "@/lib/order-labels";
import {
  addCustomerPaymentMethodAction,
  deleteCustomerPaymentMethodAction,
  setDefaultCustomerPaymentMethodAction,
} from "../actions";

export const metadata: Metadata = {
  title: "Moyens de paiement",
  description: "Gerez vos preferences de paiement e-cobam.",
};

export default async function CustomerPaymentsPage() {
  const session = await getCustomerSession();
  if (!session) {
    redirect("/connexion?next=/compte/paiements");
  }

  const account = await getCustomerAccount(session);
  if (!account) {
    redirect("/connexion?next=/compte/paiements");
  }

  return (
    <main className="commerce-container py-8 sm:py-12">
      <AccountPageHeader
        eyebrow="Paiements"
        title="Preferences de paiement."
        description="Enregistrez vos preferences de reglement manuel. Aucun numero de carte n'est stocke."
      />

      <AccountPageShell active="/compte/paiements">
        <div className="space-y-8">
          {account.paymentMethods.length > 0 ? (
            <section className="grid gap-4 md:grid-cols-2">
              {account.paymentMethods.map((method) => (
                <Card key={method.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <CreditCard className="text-ec-blue size-4" />
                      {method.label || paymentMethodLabels[method.method]}
                    </CardTitle>
                    <CardDescription>
                      {paymentMethodLabels[method.method]}
                      {method.holderName ? ` - ${method.holderName}` : ""}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {method.isDefault ? (
                      <Badge variant="blue">Paiement par defaut</Badge>
                    ) : (
                      <Badge variant="outline">Preference</Badge>
                    )}
                  </CardContent>
                  <CardFooter className="flex flex-wrap gap-2">
                    <form action={setDefaultCustomerPaymentMethodAction}>
                      <input type="hidden" name="paymentMethodId" value={method.id} />
                      <Button
                        type="submit"
                        variant="quiet"
                        size="sm"
                        icon={<Star className="size-4" />}
                      >
                        Defaut
                      </Button>
                    </form>
                    <form action={deleteCustomerPaymentMethodAction}>
                      <input type="hidden" name="paymentMethodId" value={method.id} />
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
              <CreditCard />
              <div>
                <AlertTitle>Aucune preference de paiement</AlertTitle>
                <AlertDescription>
                  Ajoutez une preference pour simplifier la validation de vos prochaines commandes.
                </AlertDescription>
              </div>
            </Alert>
          )}

          <form action={addCustomerPaymentMethodAction}>
            <Card>
              <CardHeader>
                <CardTitle>Ajouter une préférence</CardTitle>

              </CardHeader>
              <Separator />
              <CardContent className="grid gap-4 pt-5 sm:grid-cols-2 sm:pt-6">
                <div className="space-y-2">
                  <Label htmlFor="method">Methode</Label>
                  <Select name="method" defaultValue="BANK_TRANSFER">
                    <SelectTrigger id="method">
                      <SelectValue placeholder="Methode de paiement" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BANK_TRANSFER">Virement bancaire</SelectItem>
                      <SelectItem value="CASH_ON_DELIVERY">Paiement a la livraison</SelectItem>
                      <SelectItem value="PAY_IN_STORE">Paiement en magasin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="label">Libelle</Label>
                  <Input
                    id="label"
                    name="label"
                    placeholder="Virement entreprise, retrait magasin..."
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="holderName">Nom du titulaire</Label>
                  <Input
                    id="holderName"
                    name="holderName"
                    defaultValue={account.companyName || ""}
                  />
                </div>
              </CardContent>
              <Separator />
              <CardContent className="pt-5 sm:pt-6">
                <Label className="border-ec-line text-ec-ink flex min-h-16 items-center gap-3 rounded-2xl border p-4 text-sm font-semibold tracking-normal normal-case">
                  <Checkbox name="isDefault" defaultChecked={account.paymentMethods.length === 0} />
                  Utiliser par defaut
                </Label>
              </CardContent>
              <CardFooter>
                <Button type="submit">Ajouter la preference</Button>
              </CardFooter>
            </Card>
          </form>
        </div>
      </AccountPageShell>
    </main>
  );
}
