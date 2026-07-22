'use client';
import { useEffect, useState } from 'react';
import { Tv, RefreshCw, Trash2, Search, AlertCircle, ShieldCheck } from 'lucide-react';

interface RokuDeviceItem {
  id: string;
  deviceId: string;
  deviceName: string | null;
  deviceModel: string | null;
  appVersion: string | null;
  linkedAt: string | null;
  lastSeen: string | null;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    planTier: string;
  } | null;
}

export default function RokuDevicesPage() {
  const [devices, setDevices] = useState<RokuDeviceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://carefree-endurance-production-7621.up.railway.app';
      const res = await fetch(`${apiBase}/roku/admin/devices`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data?.success) {
        setDevices(data.data || []);
      }
    } catch (err) {
      console.error('Failed to load Roku devices for admin', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleUnlink = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remote unlink "${name || 'Roku TV'}"?`)) return;
    try {
      const token = localStorage.getItem('adminToken');
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://carefree-endurance-production-7621.up.railway.app';
      await fetch(`${apiBase}/roku/devices/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchDevices();
    } catch (err) {
      alert('Failed to unlink device');
    }
  };

  const filtered = devices.filter((dev) => {
    const term = search.toLowerCase();
    const email = dev.user?.email?.toLowerCase() || '';
    const name = `${dev.user?.firstName || ''} ${dev.user?.lastName || ''}`.toLowerCase();
    const devName = (dev.deviceName || '').toLowerCase();
    return email.includes(term) || name.includes(term) || devName.includes(term);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <Tv className="w-7 h-7 text-indigo-600" />
            Connected Roku Devices
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Monitor and manage active FamilyCare TV Roku companion devices platform-wide.
          </p>
        </div>
        <button
          onClick={fetchDevices}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors font-medium text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <Search className="w-5 h-5 text-slate-400 ml-2" />
        <input
          type="text"
          placeholder="Search by user email, name, or device name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent outline-none text-slate-800 placeholder-slate-400 text-sm"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading Roku devices...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No connected Roku devices found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Device Name</th>
                  <th className="p-4">Plan</th>
                  <th className="p-4">Linked At</th>
                  <th className="p-4">Last Seen</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((device) => (
                  <tr key={device.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-slate-900">
                        {device.user ? `${device.user.firstName || ''} ${device.user.lastName || ''}` : 'Unknown'}
                      </div>
                      <div className="text-xs text-slate-400">{device.user?.email || 'N/A'}</div>
                    </td>
                    <td className="p-4 font-medium text-slate-800">
                      {device.deviceName || 'Roku TV'}
                      {device.deviceModel && (
                        <div className="text-xs text-slate-400 font-normal">{device.deviceModel}</div>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                        {device.user?.planTier || 'PERSONAL'}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-slate-500">
                      {device.linkedAt ? new Date(device.linkedAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-4 text-xs text-slate-500">
                      {device.lastSeen ? new Date(device.lastSeen).toLocaleString() : 'Never'}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleUnlink(device.id, device.deviceName || 'Roku TV')}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Unlink Device"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
