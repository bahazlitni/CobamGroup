"use client";

import { useState, type ComponentProps } from "react";
import type { CustomerType } from "@prisma/client";

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

type CustomerProfileFormProps = {
  action: ComponentProps<"form">["action"];
  account: {
    type: CustomerType;
    user: {
      email: string;
    };
    firstName: string | null;
    lastName: string | null;
    companyName: string | null;
    phone: string | null;
    emailMarketingOptIn: boolean;
    smsMarketingOptIn: boolean;
  };
};

export function CustomerProfileForm({ action, account }: CustomerProfileFormProps) {
  const [accountType, setAccountType] = useState<CustomerType>(account.type);
  const isCompany = accountType === "COMPANY";

  return (
    <form action={action}>
      <Card>
        <CardHeader>
          <CardTitle>Identité du compte</CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="grid gap-4 pt-5 sm:grid-cols-2 sm:pt-6">
          <div className="space-y-2">
            <Label htmlFor="type">Type de compte</Label>
            <Select
              name="type"
              value={accountType}
              onValueChange={(value) => setAccountType(value as CustomerType)}
            >
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
          {isCompany ? (
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="companyName">Société</Label>
              <Input
                id="companyName"
                name="companyName"
                autoComplete="organization"
                defaultValue={account.companyName ?? ""}
              />
            </div>
          ) : null}
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input id="phone" name="phone" type="tel" defaultValue={account.phone ?? ""} />
          </div>
        </CardContent>
        <Separator />
        <CardContent className="grid gap-3 pt-5 sm:grid-cols-2 sm:pt-6">
          <Label className="border-ec-line text-ec-ink flex min-h-16 items-center gap-3 border p-4 text-sm font-semibold tracking-normal normal-case">
            <Checkbox name="emailMarketingOptIn" defaultChecked={account.emailMarketingOptIn} />
            Recevoir les offres par email
          </Label>
          <Label className="border-ec-line text-ec-ink flex min-h-16 items-center gap-3 border p-4 text-sm font-semibold tracking-normal normal-case">
            <Checkbox name="smsMarketingOptIn" defaultChecked={account.smsMarketingOptIn} />
            Recevoir les suivis par SMS
          </Label>
        </CardContent>
        <CardFooter>
          <Button type="submit">Enregistrer</Button>
        </CardFooter>
      </Card>
    </form>
  );
}
