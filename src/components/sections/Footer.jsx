export default function Footer() {
  const links = [
    { label: 'FAQ', href: '#' },
    { label: 'Terms & Conditions', href: '#' },
    { label: 'Privacy Policy', href: '#' },
  ];

  return (
    <footer className="py-8 border-t border-gray-200">
      <div className="flex items-center justify-center gap-8 text-sm text-gray-600">
        {links.map((link, index) => (
          <span key={link.label} className="flex items-center gap-8">
            <a href={link.href} className="hover:text-gray-900 transition-colors font-medium">
              {link.label}
            </a>
            {index < links.length - 1 && <span className="text-gray-300">·</span>}
          </span>
        ))}
      </div>
    </footer>
  );
}
