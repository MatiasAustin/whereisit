'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Users, 
  FileText, 
  Settings, 
  BarChart3, 
  Megaphone, 
  Sparkles, 
  ChevronDown, 
  ExternalLink,
  Layers,
  Tag,
  Inbox,
  Mail,
  Sliders,
  DollarSign,
  Truck,
  CreditCard,
  MessageSquare,
  Compass
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/authContext';

interface NavSubItem {
  name: string;
  href: string;
  badge?: number | string;
}

interface NavItem {
  name: string;
  icon: React.ElementType;
  href?: string;
  subItems?: NavSubItem[];
}

export function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'Sales': true,
    'Products': true,
    'Studio Custom': true,
    'Content': false,
    'Marketing': false,
    'Settings': false,
  });

  const toggleSection = (name: string) => {
    setOpenSections((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const navItems: NavItem[] = [
    { name: 'Overview', href: '/admin', icon: LayoutDashboard },
    {
      name: 'Sales',
      icon: ShoppingBag,
      subItems: [
        { name: 'Orders', href: '/admin/orders' },
        { name: 'Draft Orders', href: '/admin/orders/draft' },
        { name: 'Abandoned Checkouts', href: '/admin/orders/abandoned' },
      ],
    },
    {
      name: 'Products',
      icon: Package,
      subItems: [
        { name: 'All Products', href: '/admin/products' },
        { name: 'Collections', href: '/admin/products/collections' },
        { name: 'Inventory & Stock', href: '/admin/products/inventory' },
        { name: 'Product Reviews', href: '/admin/products/reviews' },
      ],
    },
    {
      name: 'Studio Custom',
      icon: Sparkles,
      subItems: [
        { name: 'Design Briefs', href: '/admin/custom/design' },
        { name: 'Character Keepsakes', href: '/admin/custom/character' },
      ],
    },
    { name: 'Customers', href: '/admin/customers', icon: Users },
    {
      name: 'Marketing',
      icon: Megaphone,
      subItems: [
        { name: 'Discounts & Codes', href: '/admin/marketing/discounts' },
        { name: 'Email Subscribers', href: '/admin/marketing/email' },
      ],
    },
    {
      name: 'Content & CMS',
      icon: FileText,
      subItems: [
        { name: 'Homepage Editor', href: '/admin/content/homepage' },
        { name: 'Announcements', href: '/admin/content/announcements' },
        { name: 'Studio Journal', href: '/admin/content/blog' },
      ],
    },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    {
      name: 'Settings',
      icon: Settings,
      subItems: [
        { name: 'Store Profile', href: '/admin/settings/store' },
        { name: 'Shipping & Couriers', href: '/admin/settings/shipping' },
        { name: 'Payments & Settlement', href: '/admin/settings/payments' },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-[#14191F] text-[#8E9FAA] h-screen flex flex-col sticky top-0 overflow-y-auto no-scrollbar border-r border-[#232D37] shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-[#232D37] flex items-center justify-between">
        <div>
          <Link href="/admin" className="flex items-baseline gap-1">
            <span className="text-xl font-black tracking-tight text-white lowercase">
              where<span className="text-[#8BA1B4]">is</span>it
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#8BA1B4] inline-block mb-1"></span>
          </Link>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <p className="text-[10px] text-[#6C7E8E] uppercase tracking-widest font-semibold">Studio Admin</p>
          </div>
        </div>

        <Link
          href="/"
          target="_blank"
          className="p-1.5 rounded-lg text-[#6C7E8E] hover:text-white hover:bg-[#1E2630] transition-colors"
          title="Open Live Website"
        >
          <ExternalLink className="w-4 h-4" />
        </Link>
      </div>

      {/* Navigation Tree */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = item.href === pathname || (item.subItems && item.subItems.some((sub) => pathname === sub.href || pathname.startsWith(sub.href)));

          if (item.subItems) {
            const isOpen = openSections[item.name];
            return (
              <div key={item.name} className="mb-1">
                <button
                  type="button"
                  onClick={() => toggleSection(item.name)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl transition-all',
                    isActive
                      ? 'text-white bg-[#1E2630]'
                      : 'text-[#8E9FAA] hover:text-white hover:bg-[#1A222A]'
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <item.icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-[#8BA1B4]' : 'text-[#6C7E8E]')} />
                    <span>{item.name}</span>
                  </div>
                  <ChevronDown className={cn('h-3.5 w-3.5 transition-transform duration-200 text-[#6C7E8E]', isOpen ? 'rotate-180' : '')} />
                </button>

                {isOpen && (
                  <div className="mt-1 space-y-0.5 pl-8 pr-1">
                    {item.subItems.map((subItem) => {
                      const isSubActive = pathname === subItem.href;
                      return (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          className={cn(
                            'flex items-center justify-between px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
                            isSubActive
                              ? 'bg-[#5C7489] text-white shadow-sm font-semibold'
                              : 'text-[#7A8B99] hover:text-white hover:bg-[#1E2630]'
                          )}
                        >
                          <span>{subItem.name}</span>
                          {subItem.badge && (
                            <span className="text-[10px] bg-[#14191F] text-[#8BA1B4] px-1.5 py-0.2 rounded-full font-bold">
                              {subItem.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href!}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl transition-all mb-1',
                isActive
                  ? 'bg-[#5C7489] text-white shadow-sm font-semibold'
                  : 'text-[#8E9FAA] hover:text-white hover:bg-[#1A222A]'
              )}
            >
              <item.icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-white' : 'text-[#6C7E8E]')} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-[#232D37] flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#5C7489] text-white flex items-center justify-center font-bold text-xs">
            W
          </div>
          <div className="overflow-hidden">
            <p className="text-white font-semibold truncate leading-tight">Studio Master</p>
            <p className="text-[10px] text-[#6C7E8E] truncate">admin@whereisit.design</p>
          </div>
        </div>

        <button
          onClick={() => logout()}
          className="p-1.5 rounded-lg text-[#6C7E8E] hover:text-red-400 hover:bg-[#1E2630] transition-colors"
          title="Log out"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
