'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, MessageSquare, ShoppingBag } from 'lucide-react';

export default function AdminNav() {
  const pathname = usePathname();

  const links = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Enquiries', href: '/admin/enquiries', icon: MessageSquare },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  ];

  return (
    <nav className="flex flex-col gap-2">
      {links.map((link) => {
        const isActive = pathname === link.href || (link.href !== '/admin' && pathname.startsWith(link.href));
        const Icon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-sm transition duration-150 ease-in-out text-sm ${
              isActive 
                ? 'bg-[#141414] text-[#D4A017] border-l-2 border-[#D4A017]' 
                : 'text-[#9A9A9A] hover:bg-[#141414] hover:text-[#F5F5F5] border-l-2 border-transparent'
            }`}
          >
            <Icon size={20} />
            {link.name}
          </Link>
        );
      })}
    </nav>
  );
}
