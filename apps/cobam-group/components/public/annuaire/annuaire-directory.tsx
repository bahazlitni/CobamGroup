"use client";

import { Fragment, useMemo, useState } from "react";
import { Building2, Mail, MessageCircle, Search, Users } from "lucide-react";
import type { AnnuairePersonDto } from "@/features/annuaire/types";

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function uniqueSorted(values: string[]) {
  return Array.from(
    new Set(values.map((value) => value.trim()).filter(Boolean)),
  ).sort((a, b) => a.localeCompare(b, "fr"));
}

function buildWhatsAppHref(value: string) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits.startsWith("216") ? digits : `216${digits}`}`;
}

function displayValue(value: string) {
  return value.trim() || "-";
}

function getFullName(person: AnnuairePersonDto) {
  return `${person.firstName} ${person.lastName}`.trim();
}

function compareByFullName(a: AnnuairePersonDto, b: AnnuairePersonDto) {
  return getFullName(a).localeCompare(getFullName(b), "fr", {
    sensitivity: "base",
  });
}

export default function AnnuaireDirectory({
  people,
}: {
  people: AnnuairePersonDto[];
}) {
  const [search, setSearch] = useState("");
  const [site, setSite] = useState("all");
  const [jobTitle, setJobTitle] = useState("all");

  const siteOptions = useMemo(
    () => uniqueSorted(people.map((person) => person.site)),
    [people],
  );
  const jobTitleOptions = useMemo(
    () => uniqueSorted(people.map((person) => person.jobTitle)),
    [people],
  );

  const filteredPeople = useMemo(() => {
    const query = normalize(search);

    return people.filter((person) => {
      if (site !== "all" && person.site !== site) return false;
      if (jobTitle !== "all" && person.jobTitle !== jobTitle) return false;
      if (!query) return true;

      const haystack = normalize(
        [
          person.lastName,
          person.firstName,
          person.jobTitle,
          person.email,
          person.site,
          person.extension,
          person.whatsapp,
        ].join(" "),
      );

      return haystack.includes(query);
    });
  }, [jobTitle, people, search, site]);

  const groupedPeople = useMemo(() => {
    const groups = new Map<string, AnnuairePersonDto[]>();

    for (const person of filteredPeople) {
      const siteName = person.site.trim() || "Site non renseigne";
      const current = groups.get(siteName) ?? [];
      current.push(person);
      groups.set(siteName, current);
    }

    return Array.from(groups.entries())
      .map(([siteName, items]) => ({
        siteName,
        items: [...items].sort(compareByFullName),
      }))
      .sort((a, b) => a.siteName.localeCompare(b.siteName, "fr"));
  }, [filteredPeople]);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-cobam-quill-grey/50 bg-white p-5">
          <Users className="h-5 w-5 text-cobam-water-blue" />
          <p className="mt-4 text-3xl font-light text-cobam-dark-blue">
            {people.length}
          </p>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-cobam-carbon-grey">
            Contacts
          </p>
        </div>
        <div className="rounded-lg border border-cobam-quill-grey/50 bg-white p-5">
          <Building2 className="h-5 w-5 text-cobam-water-blue" />
          <p className="mt-4 text-3xl font-light text-cobam-dark-blue">
            {siteOptions.length || "-"}
          </p>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-cobam-carbon-grey">
            Sites
          </p>
        </div>
        <div className="rounded-lg border border-cobam-quill-grey/50 bg-white p-5">
          <Search className="h-5 w-5 text-cobam-water-blue" />
          <p className="mt-4 text-3xl font-light text-cobam-dark-blue">
            {filteredPeople.length}
          </p>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-cobam-carbon-grey">
            Resultats
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-cobam-quill-grey/50 bg-white p-4 sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[1fr_220px_260px]">
          <label className="relative block">
            <span className="sr-only">Rechercher</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-cobam-carbon-grey" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher un collaborateur, un poste, un site..."
              className="h-12 w-full rounded-lg border border-cobam-quill-grey/60 bg-cobam-light-bg pl-11 pr-4 text-sm text-cobam-dark-blue outline-none transition-colors placeholder:text-cobam-carbon-grey/70 focus:border-cobam-water-blue/60 focus:bg-white"
            />
          </label>

          <select
            value={site}
            onChange={(event) => setSite(event.target.value)}
            className="h-12 rounded-lg border border-cobam-quill-grey/60 bg-cobam-light-bg px-4 text-sm text-cobam-dark-blue outline-none transition-colors focus:border-cobam-water-blue/60 focus:bg-white"
            aria-label="Filtrer par site"
          >
            <option value="all">Tous les sites</option>
            {siteOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <select
            value={jobTitle}
            onChange={(event) => setJobTitle(event.target.value)}
            className="h-12 rounded-lg border border-cobam-quill-grey/60 bg-cobam-light-bg px-4 text-sm text-cobam-dark-blue outline-none transition-colors focus:border-cobam-water-blue/60 focus:bg-white"
            aria-label="Filtrer par poste"
          >
            <option value="all">Tous les postes</option>
            {jobTitleOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="hidden overflow-hidden rounded-3xl border border-cobam-quill-grey/50 bg-white lg:block">
        <table className="min-w-full divide-y divide-cobam-quill-grey/40 text-sm">
          <thead className="bg-cobam-light-bg">
            <tr>
              {[
                "Collaborateur",
                "Poste",
                "Adresse Email",
                "Site",
                "Extension",
                "WhatsApp",
              ].map((column) => (
                <th
                  key={column}
                  className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-cobam-carbon-grey"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-cobam-quill-grey/30">
            {groupedPeople.map((group) => (
              <Fragment key={group.siteName}>
                <tr className="bg-cobam-dark-blue/95">
                  <td
                    colSpan={6}
                    className="px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white"
                  >
                    {group.siteName}
                    <span className="ml-3 text-white/50">
                      {group.items.length} contact
                      {group.items.length > 1 ? "s" : ""}
                    </span>
                  </td>
                </tr>

                {group.items.map((person) => {
                  const whatsappHref = buildWhatsAppHref(person.whatsapp);

                  return (
                    <tr
                      key={person.id}
                      className="transition-colors hover:bg-cobam-light-bg/70"
                    >
                      <td className="px-5 py-4 font-medium text-cobam-dark-blue">
                        {displayValue(getFullName(person))}
                      </td>
                      <td className="px-5 py-4 text-cobam-carbon-grey">
                        {displayValue(person.jobTitle)}
                      </td>
                      <td className="px-5 py-4">
                        {person.email ? (
                          <a
                            href={`mailto:${person.email}`}
                            className="text-cobam-dark-blue transition-colors hover:text-cobam-water-blue"
                          >
                            {person.email}
                          </a>
                        ) : (
                          <span className="text-cobam-carbon-grey">-</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-cobam-carbon-grey">
                        {displayValue(person.site)}
                      </td>
                      <td className="px-5 py-4 text-cobam-carbon-grey">
                        {displayValue(person.extension)}
                      </td>
                      <td className="px-5 py-4">
                        {whatsappHref ? (
                          <a
                            href={whatsappHref}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 text-cobam-dark-blue transition-colors hover:text-cobam-water-blue"
                          >
                            <MessageCircle className="h-4 w-4" />
                            {person.whatsapp}
                          </a>
                        ) : (
                          <span className="text-cobam-carbon-grey">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </Fragment>
            ))}
          </tbody>
        </table>

        {filteredPeople.length === 0 ? (
          <div className="px-5 py-16 text-center text-sm text-cobam-carbon-grey">
            Aucun resultat trouve.
          </div>
        ) : null}
      </div>

      <div className="grid gap-5 lg:hidden">
        {groupedPeople.map((group) => (
          <section key={group.siteName} className="space-y-3">
            <div className="rounded-lg bg-cobam-dark-blue px-5 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white">
                {group.siteName}
                <span className="ml-3 text-white/50">
                  {group.items.length} contact
                  {group.items.length > 1 ? "s" : ""}
                </span>
              </p>
            </div>

            {group.items.map((person) => {
              const whatsappHref = buildWhatsAppHref(person.whatsapp);

              return (
                <article
                  key={person.id}
                  className="rounded-3xl border border-cobam-quill-grey/50 bg-white p-5"
                >
                  <p className="text-lg font-medium text-cobam-dark-blue">
                    {displayValue(getFullName(person))}
                  </p>
                  <p className="mt-1 text-sm text-cobam-carbon-grey">
                    {displayValue(person.jobTitle)}
                  </p>
                  <div className="mt-5 grid gap-3 text-sm text-cobam-carbon-grey">
                    <p>
                      <span className="text-cobam-dark-blue">Site :</span>{" "}
                      {displayValue(person.site)}
                    </p>
                    <p>
                      <span className="text-cobam-dark-blue">Extension :</span>{" "}
                      {displayValue(person.extension)}
                    </p>
                    {person.email ? (
                      <a
                        href={`mailto:${person.email}`}
                        className="inline-flex items-center gap-2 text-cobam-dark-blue"
                      >
                        <Mail className="h-4 w-4 text-cobam-water-blue" />
                        {person.email}
                      </a>
                    ) : null}
                    {whatsappHref ? (
                      <a
                        href={whatsappHref}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-cobam-dark-blue"
                      >
                        <MessageCircle className="h-4 w-4 text-cobam-water-blue" />
                        {person.whatsapp}
                      </a>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </section>
        ))}

        {filteredPeople.length === 0 ? (
          <div className="rounded-3xl border border-cobam-quill-grey/50 bg-white px-5 py-12 text-center text-sm text-cobam-carbon-grey">
            Aucun resultat trouve.
          </div>
        ) : null}
      </div>
    </div>
  );
}
