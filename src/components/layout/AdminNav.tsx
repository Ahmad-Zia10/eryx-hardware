'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminNav() {
  const pathname = usePathname();

  const links = [
    { name: 'Dashboard', href: '/admin' },
    { name: 'Products', href: '/admin/products' },
    { name: 'Enquiries', href: '/admin/enquiries' },
    { name: 'Orders', href: '/admin/orders' },
  ];

  return (
    <nav className="flex flex-col gap-2">
      {links.map((link) => {
        const isActive = pathname === link.href || (link.href !== '/admin' && pathname.startsWith(link.href));
        return (
          <Link
            key={link.name}
            href={link.href}
            className={`px-4 py-3 rounded-lg font-medium transition-colors ${
              isActive 
                ? 'bg-[#2A2A2A] text-[#D4A017]' 
                : 'text-[#A3A3A3] hover:bg-[#2A2A2A] hover:text-[#F5F5F5]'
            }`}
          >
            {link.name}
          </Link>
        );
      })}
    </nav>
  );
}
