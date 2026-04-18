import { slugify } from "@/lib/slugify";

export type TeamMember = {
    firstname: string;
    lastname: string;
    jobTitle: string;
    isVIP?: boolean;
}

export function getTeamMemberFullname(member: TeamMember){
    const firstnameSafe = member.firstname.charAt(0).toUpperCase() + member.firstname.slice(1).toLowerCase();
    const lastNameSafe = member.lastname.charAt(0).toUpperCase() + member.lastname.slice(1).toLowerCase();
    return `${firstnameSafe} ${lastNameSafe}`;
}

export function resolveTeamMemberUrl(member: TeamMember){
    return `/images/notre-equipe/${slugify(`${member.firstname}-${member.lastname}`)}.webp`;
}

export const notreEquipe: TeamMember[] = [
    {
        firstname: "Mehnni",
        lastname: "Ben Maad",
        jobTitle: "Fondateur",
        isVIP: true,
    },
    {
        firstname: "Naceur",
        lastname: "El Benna",
        jobTitle: "PDG",
        isVIP: true,
    },
    {
        firstname: "Lassad",
        lastname: "Ben Mimoun",
        jobTitle: "Finance",
    },
    {
        firstname: "Noomen",
        lastname: "Ben Marzoug",
        jobTitle: "Finance",
    },
    {
        firstname: "Sarra",
        lastname: "Zouari",
        jobTitle: "Directeur financier",
    },
    {
        firstname: "Sabra",
        lastname: "Berriche",
        jobTitle: "Assistante de direction",
    },
    {
        firstname: "Sameh",
        lastname: "Khmekhem",
        jobTitle: "Directrice commercial",
    },
    {
        firstname: "Abdelraouf",
        lastname: "Yamoun",
        jobTitle: "Commercial",
    },
    {
        firstname: "Hbib",
        lastname: "Ben Mansour",
        jobTitle: "Chef de salle",
    },
    {
        firstname: "Abedrahman",
        lastname: "Ben Baaziz",
        jobTitle: "Commercial",
    },
    {
        firstname: "Salah",
        lastname: "Ben Amor",
        jobTitle: "Commercial",
    },
    {
        firstname: "Wassila",
        lastname: "Ben Massaoud",
        jobTitle: "Commercial",
    },
    {
        firstname: "Tasnim",
        lastname: "Ben Rached",
        jobTitle: "Commercial",
    },
]