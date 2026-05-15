import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccountNav } from "@/components/account/account-nav";
import { Button } from "@/components/ui/button";
import { getCustomerAccount } from "@/lib/customer-account";
import { getCustomerSession } from "@/lib/customer-auth";
import { updateCustomerProfileAction } from "../actions";

export const metadata: Metadata = {
  title: "Profil client",
  description: "Gerez votre profil e-cobam.",
};

const inputClass =
  "h-12 w-full rounded-2xl border border-ec-line bg-white px-4 text-sm font-semibold text-ec-ink outline-none transition focus:border-ec-blue";
const labelClass = "text-xs font-bold uppercase tracking-[0.18em] text-ec-muted";

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
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-ec-blue">Profil</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-ec-ink sm:text-6xl">
          Vos informations.
        </h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <AccountNav active="/compte/profil" />

        <form action={updateCustomerProfileAction} className="rounded-[1.5rem] border border-ec-line bg-white p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className={labelClass}>Type de compte</span>
              <select name="type" defaultValue={account.type} className={inputClass}>
                <option value="INDIVIDUAL">Particulier</option>
                <option value="COMPANY">Entreprise</option>
              </select>
            </label>
            <label className="space-y-2">
              <span className={labelClass}>Email</span>
              <input value={account.user.email} disabled className={`${inputClass} bg-ec-paper text-ec-muted`} />
            </label>
            <label className="space-y-2">
              <span className={labelClass}>Prenom</span>
              <input name="firstName" defaultValue={account.firstName ?? ""} className={inputClass} />
            </label>
            <label className="space-y-2">
              <span className={labelClass}>Nom</span>
              <input name="lastName" defaultValue={account.lastName ?? ""} className={inputClass} />
            </label>
            <label className="space-y-2">
              <span className={labelClass}>Société</span>
              <input name="companyName" defaultValue={account.companyName ?? ""} className={inputClass} />
            </label>
            <label className="space-y-2">
              <span className={labelClass}>Identifiant fiscal</span>
              <input name="taxIdentifier" defaultValue={account.taxIdentifier ?? ""} className={inputClass} />
            </label>
            <label className="space-y-2 sm:col-span-2">
              <span className={labelClass}>Téléphone</span>
              <input name="phone" type="tel" defaultValue={account.phone ?? ""} className={inputClass} />
            </label>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <label className="flex items-center gap-3 rounded-2xl border border-ec-line p-4 text-sm font-semibold text-ec-ink">
              <input name="emailMarketingOptIn" type="checkbox" defaultChecked={account.emailMarketingOptIn} />
              Recevoir les offres par email
            </label>
            <label className="flex items-center gap-3 rounded-2xl border border-ec-line p-4 text-sm font-semibold text-ec-ink">
              <input name="smsMarketingOptIn" type="checkbox" defaultChecked={account.smsMarketingOptIn} />
              Recevoir les suivis par SMS
            </label>
          </div>

          <Button type="submit" className="mt-6">
            Enregistrer le profil
          </Button>
        </form>
      </div>
    </main>
  );
}
