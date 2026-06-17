'use client';
import { useState, useEffect } from 'react';
import { Activity, Search, Filter } from 'lucide-react';

export default function ReferralsPage() {
  const [referrals, setReferrals] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchReferrals = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://carefree-endurance-production-7621.up.railway.app'}/referrals/admin/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setReferrals(data);
      }
    } catch(e) { console.error('Failed to fetch'); }
  };

  useEffect(() => { fetchReferrals(); }, []);

  const filteredReferrals = referrals.filter(r => {
    const term = search.toLowerCase();
    const referrerName = `${r.referrer?.firstName} ${r.referrer?.lastName}`.toLowerCase();
    const referredName = `${r.referredUser?.firstName} ${r.referredUser?.lastName}`.toLowerCase();
    const matchesSearch = referrerName.includes(term) || referredName.includes(term);
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-green-100 rounded-2xl text-green-600">
          <Activity className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Referrals</h1>
          <p className="text-slate-500 mt-1">Manage user referrals and commission eligibility.</p>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
            <input 
              type="text" 
              placeholder="Search by name..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>
          <div className="sm:w-64 relative">
            <Filter className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none appearance-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="REGISTERED">Registered</option>
              <option value="SUBSCRIBED">Subscribed</option>
              <option value="PAID">Paid</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-sm font-medium text-slate-500">
                <th className="p-4">Referrer</th>
                <th className="p-4">Referred User</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-center">Commission Eligible</th>
              </tr>
            </thead>
            <tbody>
              {filteredReferrals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">No referrals found.</td>
                </tr>
              ) : (
                filteredReferrals.map((r) => (
                  <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-slate-800">{r.referrer?.firstName} {r.referrer?.lastName}</div>
                      <div className="text-xs text-slate-500">{r.referrer?.email}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-slate-800">{r.referredUser?.firstName} {r.referredUser?.lastName}</div>
                      <div className="text-xs text-slate-500">{r.referredUser?.email}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                        r.status === 'SUBSCRIBED' ? 'bg-blue-100 text-blue-700' :
                        r.status === 'REGISTERED' ? 'bg-amber-100 text-amber-700' :
                        r.status === 'PAID' ? 'bg-green-100 text-green-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-600">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${r.commissionEligible ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                        {r.commissionEligible ? '✓' : '×'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
