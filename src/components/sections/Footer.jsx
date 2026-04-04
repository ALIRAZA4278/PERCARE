export default function Footer() {
  const links = [
    { label: 'FAQ', href: '#' },
    { label: 'Terms & Conditions', href: '#' },
    { label: 'Privacy Policy', href: '#' },
  ];

  return (
    <footer className="py-6 sm:py-8 border-t border-gray-200 px-4">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-gray-600">
        {links.map((link, index) => (
          <span key={link.label} className="flex items-center gap-4 sm:gap-8">
            <a href={link.href} className="hover:text-gray-900 transition-colors font-medium">
              {link.label}
            </a>
            {index < links.length - 1 && <span className="text-gray-300 hidden sm:inline">·</span>}
          </span>
        ))}
      </div>
    </footer>
  );
}
