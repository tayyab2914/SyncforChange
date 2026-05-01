import Link from "next/link";

const EXPLORE_LINKS = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const PLATFORM_LINKS = [
  { href: "/admin", label: "Admin Login" },
  { href: "/privacy", label: "Privacy Policy" },
];

export default function Footer() {
  return (
    <footer className="w-full mt-20 pb-12 bg-[#fcf9f8] border-t border-stone-200">
      <div className="max-w-7xl mx-auto px-8 pt-12 flex flex-col md:flex-row justify-between items-start gap-12">
        <div className="max-w-sm">
          <p className="font-bold text-[#a43c2a] text-xl mb-4 tracking-tighter">
            Living Journal
          </p>
          <p className="text-sm leading-relaxed text-stone-500">
            © 2024 Living Journal Nonprofit. Curating stories of change.
            Empowering communities through transparency and action.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-12">
          <FooterLinkGroup title="Explore" links={EXPLORE_LINKS} />
          <FooterLinkGroup title="Platform" links={PLATFORM_LINKS} />
        </div>
      </div>
    </footer>
  );
}

function FooterLinkGroup({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div className="space-y-4">
      <h5 className="font-bold text-xs uppercase tracking-widest text-on-surface">
        {title}
      </h5>
      <div className="flex flex-col gap-3 text-sm">
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="text-stone-500 hover:text-[#a43c2a] transition-all"
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
