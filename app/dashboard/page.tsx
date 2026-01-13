'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import ApiKeyManager from '@/components/dashboard/api-key-manager';
import Link from 'next/link';
import { LogOut } from 'lucide-react';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null);
    const [credits, setCredits] = useState<number | null>(null);

    useEffect(() => {
        supabase.auth.getUser().then(async ({ data: { user } }) => {
            if (!user) {
                window.location.href = '/login';
            } else {
                setUser(user);
                // Fetch Credits
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('credits')
                    .eq('id', user.id)
                    .single();
                
                setCredits(profile?.credits ?? 0);
            }
        });
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        window.location.href = '/';
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Top Navigation */}
            <nav className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center shadow-sm">
                <Link href="/" className="font-extrabold text-2xl tracking-tight text-slate-900">
                    OpenRemover <span className="text-blue-600 font-medium">Developer</span>
                </Link>
                <div className="flex items-center gap-4">
                     {/* Credit Badge in Nav */}
                     <div className="hidden md:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-sm font-bold text-slate-700">{credits !== null ? credits : '...'} Credits</span>
                     </div>
                    <button 
                        onClick={handleSignOut} 
                        className="text-sm font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition-all flex items-center gap-2 border border-transparent hover:border-red-100"
                    >
                        <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-12">
                
                {/* Header Section */}
                <div className="mb-12">
                    <h1 className="text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">Developer Dashboard</h1>
                    <p className="text-lg text-slate-600 max-w-2xl">
                        Welcome back. Manage your API keys, monitor your usage, and configure your account settings here.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    
                    {/* LEFT COLUMN: Account & Stats (4 cols) */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Account Card */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold">
                                    {user.email?.[0].toUpperCase()}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">My Account</h2>
                                    <span className="inline-block bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider mt-1">
                                        Free Plan
                                    </span>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Email Address</label>
                                    <p className="text-lg font-medium text-slate-900 break-all">{user.email}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase block mb-1">User ID</label>
                                    <code className="bg-slate-100 px-2 py-1 rounded text-sm font-mono text-slate-600 block truncate" title={user.id}>
                                        {user.id}
                                    </code>
                                </div>
                            </div>
                        </div>

                        {/* Usage Stats & Credit Shop */}
                        <div className="space-y-6">
                            {/* Current Balance - Full Width */}
                            <div className="bg-slate-900 p-8 rounded-2xl shadow-lg text-white relative overflow-hidden flex items-center justify-between">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-[100px] opacity-20 transform translate-x-20 -translate-y-20" />
                                
                                <div className="relative z-10">
                                    <h3 className="text-sm font-bold text-slate-400 uppercase mb-2">Available Credits</h3>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-5xl font-extrabold tracking-tighter">
                                            {credits !== null ? credits : '-'}
                                        </span>
                                        <span className="text-lg font-medium text-slate-400">remaining</span>
                                    </div>
                                </div>
                                <div className="relative z-10 hidden sm:block text-right">
                                    <p className="text-sm text-slate-400 mb-1">Status</p>
                                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-bold uppercase tracking-wider">
                                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Active
                                    </span>
                                </div>
                            </div>

                            {/* Credit Shop (McDonald's Style) */}
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    Top Up Credits <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-1 rounded-full">Secure Payment via Stripe</span>
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Small Pack */}
                                    <div className="bg-white border-2 border-slate-100 p-6 rounded-2xl hover:border-blue-200 hover:shadow-lg transition-all group relative overflow-hidden">
                                        <div className="mb-4">
                                            <span className="text-2xl pt-2">🥤</span>
                                            <h4 className="font-bold text-slate-900 text-lg">Small Pack</h4>
                                            <p className="text-slate-500 text-sm">Starter Boost</p>
                                        </div>
                                        <div className="mb-6">
                                            <p className="text-3xl font-extrabold text-slate-900">50 <span className="text-sm font-medium text-slate-400">credits</span></p>
                                            <p className="text-slate-900 font-bold mt-1">$4.99</p>
                                        </div>
                                        <a href="#" className="block w-full py-2.5 rounded-xl bg-slate-100 text-slate-900 font-bold text-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
                                            Buy Small
                                        </a>
                                    </div>

                                    {/* Medium Pack (Highlighted) */}
                                    <div className="bg-white border-2 border-blue-500 p-6 rounded-2xl shadow-xl shadow-blue-500/10 relative overflow-hidden transform md:-translate-y-2">
                                        <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                                            Best Value
                                        </div>
                                        <div className="mb-4">
                                            <span className="text-3xl">🥤</span>
                                            <h4 className="font-bold text-slate-900 text-xl">Medium Pack</h4>
                                            <p className="text-blue-600 text-sm font-medium">Most Popular</p>
                                        </div>
                                        <div className="mb-6">
                                            <p className="text-4xl font-extrabold text-slate-900">150 <span className="text-sm font-medium text-slate-400">credits</span></p>
                                            <p className="text-slate-900 font-bold mt-1">$12.99</p>
                                        </div>
                                        <a href="#" className="block w-full py-3 rounded-xl bg-blue-600 text-white font-bold text-center shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-colors">
                                            Buy Medium
                                        </a>
                                    </div>

                                    {/* Large Pack */}
                                    <div className="bg-white border-2 border-slate-100 p-6 rounded-2xl hover:border-purple-200 hover:shadow-lg transition-all group">
                                        <div className="mb-4">
                                            <span className="text-4xl">🥤</span>
                                            <h4 className="font-bold text-slate-900 text-lg">Large Pack</h4>
                                            <p className="text-slate-500 text-sm">Agency Size</p>
                                        </div>
                                        <div className="mb-6">
                                            <p className="text-3xl font-extrabold text-slate-900">500 <span className="text-sm font-medium text-slate-400">credits</span></p>
                                            <p className="text-slate-900 font-bold mt-1">$34.99</p>
                                        </div>
                                        <a href="#" className="block w-full py-2.5 rounded-xl bg-slate-100 text-slate-900 font-bold text-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
                                            Buy Large
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: API Keys & Docs (8 cols) */}
                    <div className="lg:col-span-8 space-y-10">
                        
                        <ApiKeyManager userId={user.id} />

                        {/* Documentation Snippet */}
                        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-8">
                            <h3 className="text-lg font-bold text-blue-900 mb-3">Quick Integration</h3>
                            <p className="text-blue-700 mb-6">
                                Authenticate your requests by including your secret key in the <code>x-api-key</code> header.
                            </p>
                            <div className="bg-slate-900 rounded-xl overflow-hidden shadow-sm">
                                <div className="flex items-center px-4 py-2 bg-slate-800 border-b border-slate-700">
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                        <div className="w-3 h-3 rounded-full bg-green-500" />
                                    </div>
                                    <span className="ml-4 text-xs text-slate-400 font-mono">cURL Example</span>
                                </div>
                                <div className="p-6 overflow-x-auto">
                                <pre className="font-mono text-sm text-green-400">
{`curl -X POST https://openremover.vercel.app/api/v1/remove \\
  -H "x-api-key: YOUR_API_KEY" \\
  -F "image=@photo.jpg" \\
  --output result.png`}
                                </pre>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
