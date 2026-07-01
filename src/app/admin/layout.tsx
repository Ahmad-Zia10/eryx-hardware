import { createClient, supabaseAdmin } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import AdminNav from '@/components/layout/AdminNav';
import { signOut } from '@/app/admin/actions';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/admin');
  }

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    redirect('/');
  }

  return (
    <div className="flex h-screen bg-[#0A0A0A]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0A0A0A] border-r border-[#2A2A2A] flex flex-col h-full shrink-0 z-10">
        <div className="p-6">
          <Link href="/admin" className="font-serif font-bold text-2xl tracking-widest text-[#F5F5F5]">
            ERYX <span className="text-[#D4A017] text-sm tracking-normal uppercase ml-1">Admin</span>
          </Link>
        </div>

        <div className="flex-1 px-4 py-2 overflow-y-auto">
          <AdminNav />
        </div>

        <div className="p-4 border-t border-[#2A2A2A] space-y-2">
          <Link 
            href="/" 
            target="_blank" 
            className="flex w-full px-4 py-3 text-sm text-[#9A9A9A] hover:text-[#F5F5F5] transition-colors rounded-sm"
          >
            Back to Site ↗
          </Link>
          <form action={signOut}>
            <button 
              type="submit" 
              className="w-full text-left px-4 py-3 text-sm text-[#9A9A9A] hover:text-red-400 transition-colors rounded-sm"
            >
              Logout
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-[#0A0A0A]">
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
