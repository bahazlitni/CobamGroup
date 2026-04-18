import Link from "next/link";

export interface FooterLinkProps {
    href: string;
    label: string;
}

export default function FooterLink({href, label}: FooterLinkProps){
    return <Link href={href}
        className="text-gray-400 hover:text-cobam-water-blue text-sm transition-colors"
    >
        {label}
    </Link>
}