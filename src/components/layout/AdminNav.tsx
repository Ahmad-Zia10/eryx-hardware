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
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
              isActive 
                ? 'bg-[#2A2A2A] text-[#D4A017]' 
                : 'text-[#A3A3A3] hover:bg-[#2A2A2A] hover:text-[#F5F5F5]'
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
