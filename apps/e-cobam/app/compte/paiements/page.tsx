import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CreditCard, Star, Trash2 } from "lucide-react";
import { AccountNav } from "@/components/account/account-nav";
import { Button } from "@/components/ui/button";
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

const inputClass =
  "h-12 w-full rounded-2xl border border-ec-line bg-white px-4 text-sm font-semibold text-ec-ink outline-none transition focus:border-ec-blue";
const labelClass = "text-xs font-bold uppercase tracking-[0.18em] text-ec-muted";

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
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-ec-blue">Paiements</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-ec-ink sm:text-6xl">
          Preferences de paiement.
        </h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <AccountNav active="/compte/paiements" />

        <div className="space-y-8">
          <section className="grid gap-4 md:grid-cols-2">
            {account.paymentMethods.map((method) => (
              <article key={method.id} className="rounded-[1.5rem] border border-ec-line bg-white p-5">
                <p className="flex items-center gap-2 text-sm font-black text-ec-ink">
                  <CreditCard className="size-4 text-ec-blue" />
                  {method.label || paymentMethodLabels[method.method]}
                </p>
                <p className="mt-3 text-sm font-semibold text-ec-muted">
                  {paymentMethodLabels[method.method]}
                  {method.holderName ? ` - ${method.holderName}` : ""}
                </p>
                {method.isDefault ? (
                  <span className="mt-4 inline-flex rounded-full bg-ec-blue/10 px-3 py-1 text-xs font-black text-ec-blue">
                    Paiement par defaut
                  </span>
                ) : null}
                <div className="mt-5 flex flex-wrap gap-2">
                  <form action={setDefaultCustomerPaymentMethodAction}>
                    <input type="hidden" name="paymentMethodId" value={method.id} />
                    <Button type="submit" variant="quiet" size="sm" icon={<Star className="size-4" />}>
                      Defaut
                    </Button>
                  </form>
                  <form action={deleteCustomerPaymentMethodAction}>
                    <input type="hidden" name="paymentMethodId" value={method.id} />
                    <Button type="submit" variant="secondary" size="sm" icon={<Trash2 className="size-4" />}>
                      Supprimer
                    </Button>
                  </form>
                </div>
              </article>
            ))}
          </section>

          <form action={addCustomerPaymentMethodAction} className="rounded-[1.5rem] border border-ec-line bg-white p-5 sm:p-6">
            <h2 className="text-xl font-black text-ec-ink">Ajouter une preference</h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-ec-muted">
              Pour l&apos;instant, e-cobam enregistre uniquement des preferences de paiement manuel.
              Aucun numero de carte n&apos;est stocke.
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className={labelClass}>Methode</span>
                <select name="method" defaultValue="BANK_TRANSFER" className={inputClass}>
                  <option value="BANK_TRANSFER">Virement bancaire</option>
                  <option value="CASH_ON_DELIVERY">Paiement a la livraison</option>
                  <option value="PAY_IN_STORE">Paiement en magasin</option>
                </select>
              </label>
              <label className="space-y-2">
                <span className={labelClass}>Libelle</span>
                <input name="label" placeholder="Virement entreprise, retrait magasin..." className={inputClass} />
              </label>
              <label className="space-y-2 sm:col-span-2">
                <span className={labelClass}>Nom du titulaire</span>
                <input name="holderName" defaultValue={account.companyName || ""} className={inputClass} />
              </label>
            </div>
            <label className="mt-5 flex items-center gap-3 rounded-2xl border border-ec-line p-4 text-sm font-semibold text-ec-ink">
              <input name="isDefault" type="checkbox" defaultChecked={account.paymentMethods.length === 0} />
              Utiliser par defaut
            </label>
            <Button type="submit" className="mt-6">
              Ajouter la preference
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
