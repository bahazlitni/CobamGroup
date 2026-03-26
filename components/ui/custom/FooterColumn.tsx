interface FooterLink {
  label: string;
  href: string;
}

interface FooterColumnProps {
  title: string;
  links: FooterLink[];
}

export default function FooterColumn({ title, links }: FooterColumnProps) {
  return (
    <div className="flex flex-col gap-4">
      <h4 className="text-white font-bold text-sm tracking-widest uppercase">
        {title}
      </h4>
      <ul className="flex flex-col gap-3">
        {links.map((link, i) => (
          <li key={i}>
            <a
              href={link.href}
              className="text-gray-400 hover:text-cobam-water-blue text-sm transition-colors"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
