import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MapPin, Star, Trash2 } from "lucide-react";
import { AccountNav } from "@/components/account/account-nav";
import { Button } from "@/components/ui/button";
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

const inputClass =
  "h-12 w-full rounded-2xl border border-ec-line bg-white px-4 text-sm font-semibold text-ec-ink outline-none transition focus:border-ec-blue";
const labelClass = "text-xs font-bold uppercase tracking-[0.18em] text-ec-muted";

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
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-ec-blue">Adresses</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-ec-ink sm:text-6xl">
          Chantiers, livraison, facturation.
        </h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <AccountNav active="/compte/adresses" />

        <div className="space-y-8">
          <section className="grid gap-4 md:grid-cols-2">
            {account.addresses.map((address) => (
              <article key={address.id} className="rounded-[1.5rem] border border-ec-line bg-white p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="flex items-center gap-2 text-sm font-black text-ec-ink">
                      <MapPin className="size-4 text-ec-blue" />
                      {address.label || address.fullName}
                    </p>
                    <p className="mt-3 text-sm leading-7 text-ec-muted">
                      {address.addressLine1}
                      {address.addressLine2 ? `, ${address.addressLine2}` : ""}
                      <br />
                      {address.city}
                      {address.governorate ? `, ${address.governorate}` : ""}
                      {address.postalCode ? ` ${address.postalCode}` : ""}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs font-black">
                      {address.isDefaultShipping ? (
                        <span className="rounded-full bg-ec-blue/10 px-3 py-1 text-ec-blue">Livraison par defaut</span>
                      ) : null}
                      {address.isDefaultBilling ? (
                        <span className="rounded-full bg-ec-stone px-3 py-1 text-ec-ink">Facturation par defaut</span>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <form action={setDefaultCustomerAddressAction}>
                    <input type="hidden" name="addressId" value={address.id} />
                    <input type="hidden" name="kind" value="shipping" />
                    <Button type="submit" variant="quiet" size="sm" icon={<Star className="size-4" />}>
                      Livraison
                    </Button>
                  </form>
                  <form action={setDefaultCustomerAddressAction}>
                    <input type="hidden" name="addressId" value={address.id} />
                    <input type="hidden" name="kind" value="billing" />
                    <Button type="submit" variant="quiet" size="sm" icon={<Star className="size-4" />}>
                      Facturation
                    </Button>
                  </form>
                  <form action={deleteCustomerAddressAction}>
                    <input type="hidden" name="addressId" value={address.id} />
                    <Button type="submit" variant="secondary" size="sm" icon={<Trash2 className="size-4" />}>
                      Supprimer
                    </Button>
                  </form>
                </div>
              </article>
            ))}
          </section>

          <form action={addCustomerAddressAction} className="rounded-[1.5rem] border border-ec-line bg-white p-5 sm:p-6">
            <h2 className="text-xl font-black text-ec-ink">Ajouter une adresse</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className={labelClass}>Type</span>
                <select name="type" defaultValue="BOTH" className={inputClass}>
                  <option value="BOTH">Livraison et facturation</option>
                  <option value="SHIPPING">Livraison</option>
                  <option value="BILLING">Facturation</option>
                </select>
              </label>
              <label className="space-y-2">
                <span className={labelClass}>Libelle</span>
                <input name="label" placeholder="Maison, chantier, depot..." className={inputClass} />
              </label>
              <label className="space-y-2">
                <span className={labelClass}>Nom complet</span>
                <input name="fullName" required defaultValue={[account.firstName, account.lastName].filter(Boolean).join(" ")} className={inputClass} />
              </label>
              <label className="space-y-2">
                <span className={labelClass}>Téléphone</span>
                <input name="phone" type="tel" defaultValue={account.phone ?? ""} className={inputClass} />
              </label>
              <label className="space-y-2 sm:col-span-2">
                <span className={labelClass}>Adresse</span>
                <input name="addressLine1" required className={inputClass} />
              </label>
              <label className="space-y-2 sm:col-span-2">
                <span className={labelClass}>Complement</span>
                <input name="addressLine2" className={inputClass} />
              </label>
              <label className="space-y-2">
                <span className={labelClass}>Ville</span>
                <input name="city" required className={inputClass} />
              </label>
              <label className="space-y-2">
                <span className={labelClass}>Gouvernorat</span>
                <input name="governorate" className={inputClass} />
              </label>
              <label className="space-y-2">
                <span className={labelClass}>Code postal</span>
                <input name="postalCode" className={inputClass} />
              </label>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <label className="flex items-center gap-3 rounded-2xl border border-ec-line p-4 text-sm font-semibold text-ec-ink">
                <input name="isDefaultShipping" type="checkbox" />
                Adresse de livraison par defaut
              </label>
              <label className="flex items-center gap-3 rounded-2xl border border-ec-line p-4 text-sm font-semibold text-ec-ink">
                <input name="isDefaultBilling" type="checkbox" />
                Adresse de facturation par defaut
              </label>
            </div>
            <Button type="submit" className="mt-6">
              Ajouter l&apos;adresse
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
