'use client';
import { useState, useEffect } from 'react';
import { Users, Search, Activity, UserCircle, RefreshCcw, Trash2 } from 'lucide-react';

import PatientsManager from './components/PatientsManager';
import MedicationsManager from './components/MedicationsManager';
import EventsManager from './components/EventsManager';
import NotesManager from './components/NotesManager';

export default function UsersActivity() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('Overview');

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://carefree-endurance-production-7621.up.railway.app'}/users/admin/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.status === 401) {
        alert('Your admin session has expired. Please log in again.');
        localStorage.removeItem('adminToken');
        window.location.href = '/login';
        return;
      }
      if (data.success) {
        setUsers(data.data);
        if (selectedUser) {
          const updatedSelectedUser = data.data.find((u: any) => u.id === selectedUser.id);
          if (updatedSelectedUser) setSelectedUser(updatedSelectedUser);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (id: string) => {
    if (!confirm('WARNING: Deleting this user will permanently delete all of their patients, medications, events, notes, and devices. This cannot be undone. Are you sure?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'https://carefree-endurance-production-7621.up.railway.app'}`}/users/admin/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateSubscription = async (id: string, planTier: string, status: string) => {
    if (!confirm(`Are you sure you want to manually set this user's plan to ${planTier} (${status})?`)) return;
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://carefree-endurance-production-7621.up.railway.app'}/users/admin/${id}/subscription`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ planTier, status })
      });
      const data = await res.json();
      if (data.success) {
        alert('User subscription updated successfully.');
        fetchUsers(); // Refresh the list
      } else {
        alert(data.message || 'Failed to update subscription.');
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred while updating the subscription.');
    }
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(search.toLowerCase()) || 
    (u.firstName + ' ' + u.lastName).toLowerCase().includes(search.toLowerCase())
  );

  const tabs = ['Overview', 'Patients', 'Medications', 'Events', 'Notes', 'Settings'];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-indigo-500" />
            Users Activity
          </h1>
          <p className="text-slate-500 mt-2">Manage app users and control their activities across the platform.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input 
              type="text" 
              placeholder="Search users..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none w-full md:w-64 shadow-sm"
            />
          </div>
          <button 
            onClick={fetchUsers}
            className="p-2.5 bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 rounded-xl transition-all shadow-sm group"
          >
            <RefreshCcw className={`w-5 h-5 ${isLoading ? 'animate-spin text-indigo-500' : 'group-hover:-rotate-45 transition-transform'}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Users List */}
        <div className="lg:col-span-1 bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl shadow-xl shadow-slate-200/50 p-6 flex flex-col h-[700px]">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <UserCircle className="w-5 h-5 text-indigo-500" />
            All Users <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full ml-auto">{filteredUsers.length}</span>
          </h2>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <RefreshCcw className="w-8 h-8 animate-spin mb-3 text-indigo-400" />
                <p>Loading users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-10 text-slate-500">No users found.</div>
            ) : (
              filteredUsers.map(user => (
                <button
                  key={user.id}
                  onClick={() => { setSelectedUser(user); setActiveTab('Overview'); }}
                  className={`w-full text-left p-4 rounded-2xl transition-all border ${
                    selectedUser?.id === user.id 
                      ? 'bg-indigo-50 border-indigo-200 shadow-sm ring-1 ring-indigo-500/20' 
                      : 'bg-white border-slate-100 hover:border-indigo-100 hover:bg-slate-50 hover:shadow-md hover:-translate-y-0.5'
                  }`}
                >
                  <div className="font-semibold text-slate-800 truncate">{user.firstName} {user.lastName}</div>
                  <div className="text-sm text-slate-500 truncate">{user.email}</div>
                  <div className="mt-2 flex items-center gap-2 text-xs font-medium text-slate-400">
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                      {user.patients?.length || 0} Patients
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* User Detail & Activity */}
        <div className="lg:col-span-2">
          {selectedUser ? (
            <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl shadow-xl shadow-slate-200/50 p-8 h-[700px] flex flex-col animate-in fade-in zoom-in-95 duration-300">
              
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-6 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{selectedUser.firstName} {selectedUser.lastName}</h2>
                  <p className="text-slate-500">{selectedUser.email} • Joined {new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-semibold border border-indigo-100">
                  {selectedUser.role}
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex gap-2 overflow-x-auto pb-2 mb-6 custom-scrollbar">
                {tabs.map(tab => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                      activeTab === tab 
                        ? 'bg-indigo-600 text-white shadow-md' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                
                {activeTab === 'Overview' && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-indigo-500" />
                        Platform Activity
                      </h3>
                      {selectedUser.patients?.length === 0 ? (
                        <p className="text-slate-500 text-sm italic bg-slate-50 p-4 rounded-xl border border-slate-100">No patients added yet.</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {selectedUser.patients?.map((patient: any) => (
                            <div key={patient.id} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all">
                              <div className="font-bold text-slate-800 text-lg">{patient.fullName}</div>
                              <div className="text-sm text-slate-500 mb-4">{new Date(patient.dateOfBirth).toLocaleDateString()}</div>
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-slate-500">Events:</span><span className="font-medium text-slate-700">{patient.events?.length || 0}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-slate-500">Medications:</span><span className="font-medium text-slate-700">{patient.medications?.length || 0}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-slate-500">Notes:</span><span className="font-medium text-slate-700">{patient.patientNotes?.length || 0}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 mb-4">Linked Devices</h3>
                      {selectedUser.deviceLinks?.length === 0 ? (
                        <p className="text-slate-500 text-sm italic bg-slate-50 p-4 rounded-xl border border-slate-100">No linked devices found.</p>
                      ) : (
                        <div className="space-y-3">
                          {selectedUser.deviceLinks?.map((device: any) => (
                            <div key={device.id} className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between">
                              <div>
                                <div className="font-semibold text-slate-800">{device.deviceType || 'Unknown Device'}</div>
                                <div className="text-xs text-slate-500">ID: {device.deviceId}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium text-slate-700">Expires:</div>
                                <div className="text-xs text-slate-500">{new Date(device.expiresAt).toLocaleDateString()}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'Patients' && (
                  <PatientsManager user={selectedUser} token={localStorage.getItem('adminToken') || ''} onRefresh={fetchUsers} />
                )}

                {activeTab === 'Medications' && (
                  <MedicationsManager user={selectedUser} token={localStorage.getItem('adminToken') || ''} onRefresh={fetchUsers} />
                )}

                {activeTab === 'Events' && (
                  <EventsManager user={selectedUser} token={localStorage.getItem('adminToken') || ''} onRefresh={fetchUsers} />
                )}

                {activeTab === 'Notes' && (
                  <NotesManager user={selectedUser} token={localStorage.getItem('adminToken') || ''} onRefresh={fetchUsers} />
                )}

                {activeTab === 'Settings' && (
                  <div className="space-y-8">
                    
                    {/* Subscription Management */}
                    <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl">
                      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        Manage Subscription
                      </h3>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Current Plan</div>
                          <div className="font-bold text-indigo-700">{selectedUser.planTier || 'FREE_TRIAL'}</div>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Status</div>
                          <div className={`font-bold ${selectedUser.subscriptionStatus === 'active' || selectedUser.subscriptionStatus === 'trialing' ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {selectedUser.subscriptionStatus || 'trialing'}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 pt-4 border-t border-slate-200">
                        <p className="text-sm text-slate-600 font-medium mb-2">Manually Override Plan (Fix Payments/Errors)</p>
                        <div className="flex flex-wrap gap-3">
                          <button 
                            onClick={() => handleUpdateSubscription(selectedUser.id, 'FAMILY', 'active')}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all"
                          >
                            Upgrade to FAMILY (Active)
                          </button>
                          <button 
                            onClick={() => handleUpdateSubscription(selectedUser.id, 'PERSONAL', 'active')}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all"
                          >
                            Upgrade to PERSONAL (Active)
                          </button>
                          <button 
                            onClick={() => handleUpdateSubscription(selectedUser.id, 'FREE_TRIAL', 'expired')}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all"
                          >
                            Revert to FREE (Expired)
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-red-600 mb-2">Danger Zone</h3>
                      <p className="text-slate-500 text-sm mb-4">Deleting this user is irreversible. All of their data, patients, and devices will be permanently removed.</p>
                      <button 
                        onClick={() => handleDeleteUser(selectedUser.id)}
                        className="bg-red-50 text-red-600 border border-red-200 px-6 py-3 rounded-xl font-bold hover:bg-red-600 hover:text-white transition-all shadow-sm flex items-center gap-2"
                      >
                        <Trash2 className="w-5 h-5" />
                        Delete User Account
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </div>
          ) : (
            <div className="bg-white/40 backdrop-blur-sm border border-slate-200/50 rounded-3xl p-8 h-[700px] flex flex-col items-center justify-center text-slate-400">
              <Users className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg font-medium">Select a user to view and manage their data</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
