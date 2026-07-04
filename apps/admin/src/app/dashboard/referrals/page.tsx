'use client';
import { useState, useEffect } from 'react';
import { Activity, Search, Filter, Plus, Edit2, Trash2, Tag } from 'lucide-react';

export default function ReferralsPage() {
  const [activeTab, setActiveTab] = useState<'REFERRALS' | 'CODES'>('REFERRALS');
  
  // Referrals State
  const [referrals, setReferrals] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Codes State
  const [codes, setCodes] = useState<any[]>([]);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [isEditingCode, setIsEditingCode] = useState(false);
  const [editCodeId, setEditCodeId] = useState<string | null>(null);
  const [codeFormData, setCodeFormData] = useState({ code: '', commissionRate: 0, status: 'ACTIVE', maxUsages: '' });

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
    } catch(e) { console.error('Failed to fetch referrals'); }
  };

  const fetchCodes = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://carefree-endurance-production-7621.up.railway.app'}/referrals/admin/codes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCodes(data);
      }
    } catch(e) { console.error('Failed to fetch codes'); }
  };

  useEffect(() => {
    if (activeTab === 'REFERRALS') fetchReferrals();
    if (activeTab === 'CODES') fetchCodes();
  }, [activeTab]);

  const filteredReferrals = referrals.filter(r => {
    const term = search.toLowerCase();
    const referrerName = `${r.referrer?.firstName} ${r.referrer?.lastName}`.toLowerCase();
    const referredName = `${r.referredUser?.firstName} ${r.referredUser?.lastName}`.toLowerCase();
    const matchesSearch = referrerName.includes(term) || referredName.includes(term);
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      const url = isEditingCode 
        ? `${process.env.NEXT_PUBLIC_API_URL || 'https://carefree-endurance-production-7621.up.railway.app'}/referrals/admin/codes/${editCodeId}`
        : `${process.env.NEXT_PUBLIC_API_URL || 'https://carefree-endurance-production-7621.up.railway.app'}/referrals/admin/codes`;
      
      const payload = {
        ...codeFormData,
        maxUsages: codeFormData.maxUsages ? parseInt(codeFormData.maxUsages as string) : null,
      };

      const res = await fetch(url, {
        method: isEditingCode ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setShowCodeModal(false);
        fetchCodes();
        resetCodeForm();
      }
    } catch (error) {
      console.error('Failed to save code', error);
    }
  };

  const handleDeleteCode = async (id: string) => {
    if (!confirm('Are you sure you want to delete this referral code?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://carefree-endurance-production-7621.up.railway.app'}/referrals/admin/codes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchCodes();
    } catch (e) { console.error('Delete failed', e); }
  };

  const openEditCode = (code: any) => {
    setCodeFormData({
      code: code.code,
      commissionRate: code.commissionRate,
      status: code.status,
      maxUsages: code.maxUsages?.toString() || ''
    });
    setEditCodeId(code.id);
    setIsEditingCode(true);
    setShowCodeModal(true);
  };

  const resetCodeForm = () => {
    setCodeFormData({ code: '', commissionRate: 0, status: 'ACTIVE', maxUsages: '' });
    setIsEditingCode(false);
    setEditCodeId(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-green-100 rounded-2xl text-green-600">
            <Activity className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Referrals</h1>
            <p className="text-slate-500 mt-1">Manage user referrals and referral codes.</p>
          </div>
        </div>
        {activeTab === 'CODES' && (
          <button 
            onClick={() => { resetCodeForm(); setShowCodeModal(true); }}
            className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-all font-medium shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Add Code
          </button>
        )}
      </div>

      <div className="flex gap-4 border-b border-slate-200">
        <button
          className={`pb-3 px-2 font-medium border-b-2 transition-colors ${activeTab === 'REFERRALS' ? 'border-green-500 text-green-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          onClick={() => setActiveTab('REFERRALS')}
        >
          Tracked Referrals
        </button>
        <button
          className={`pb-3 px-2 font-medium border-b-2 transition-colors ${activeTab === 'CODES' ? 'border-green-500 text-green-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          onClick={() => setActiveTab('CODES')}
        >
          Referral Codes
        </button>
      </div>
      
      {activeTab === 'REFERRALS' ? (
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
                    <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-slate-900">
                          {r.referrer ? `${r.referrer.firstName} ${r.referrer.lastName}` : (r.usedCode ? `Code: ${r.usedCode}` : 'System Code')}
                        </div>
                        <div className="text-sm text-slate-500">{r.referrer?.email || 'N/A'}</div>
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
      ) : (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-sm font-medium text-slate-500">
                  <th className="p-4">Code</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Usage</th>
                  <th className="p-4">Commission %</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {codes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">No referral codes found.</td>
                  </tr>
                ) : (
                  codes.map((c) => (
                    <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-slate-800 flex items-center gap-2">
                          <Tag className="w-4 h-4 text-slate-400" />
                          {c.code}
                        </div>
                        {c.owner && (
                          <div className="text-xs text-slate-500 mt-1">Owner: {c.owner.firstName} {c.owner.lastName}</div>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                          c.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-slate-600">
                          {c.usageCount} / {c.maxUsages || '∞'}
                        </div>
                      </td>
                      <td className="p-4 text-sm font-medium text-slate-700">
                        {c.commissionRate}%
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openEditCode(c)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteCode(c.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showCodeModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">{isEditingCode ? 'Edit Code' : 'New Referral Code'}</h2>
            
            <form onSubmit={handleCodeSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Code *</label>
                <input required type="text" value={codeFormData.code} onChange={(e) => setCodeFormData({...codeFormData, code: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none uppercase font-mono" placeholder="e.g. SUMMER24" />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Commission Rate (%)</label>
                <input type="number" step="0.1" value={codeFormData.commissionRate} onChange={(e) => setCodeFormData({...codeFormData, commissionRate: parseFloat(e.target.value) || 0})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Max Usages (Leave empty for infinite)</label>
                <input type="number" value={codeFormData.maxUsages} onChange={(e) => setCodeFormData({...codeFormData, maxUsages: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none" placeholder="e.g. 100" />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
                <select value={codeFormData.status} onChange={(e) => setCodeFormData({...codeFormData, status: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none">
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowCodeModal(false)} className="flex-1 px-4 py-3 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-3 rounded-xl font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-md">
                  {isEditingCode ? 'Save' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
