'use client';

import { useState, useEffect } from 'react';

type User = { id: number; username: string; created_at: string };

export default function SettingsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser] = useState('admin');

  // Change password
  const [cpCurrent, setCpCurrent] = useState('');
  const [cpNew, setCpNew] = useState('');
  const [cpConfirm, setCpConfirm] = useState('');
  const [cpMsg, setCpMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [cpLoading, setCpLoading] = useState(false);

  // Add user
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [addMsg, setAddMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [addLoading, setAddLoading] = useState(false);

  const loadUsers = async () => {
    const res = await fetch('/api/settings/users');
    if (res.ok) setUsers(await res.json());
  };

  useEffect(() => { loadUsers(); }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cpNew !== cpConfirm) { setCpMsg({ ok: false, text: 'הסיסמאות החדשות אינן תואמות' }); return; }
    setCpLoading(true); setCpMsg(null);
    const res = await fetch('/api/settings/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: currentUser, currentPassword: cpCurrent, newPassword: cpNew }),
    });
    const data = await res.json();
    setCpMsg({ ok: res.ok, text: res.ok ? 'הסיסמה עודכנה בהצלחה' : data.error });
    if (res.ok) { setCpCurrent(''); setCpNew(''); setCpConfirm(''); }
    setCpLoading(false);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true); setAddMsg(null);
    const res = await fetch('/api/settings/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: newUsername, password: newPassword }),
    });
    const data = await res.json();
    setAddMsg({ ok: res.ok, text: res.ok ? 'המשתמש נוסף בהצלחה' : data.error });
    if (res.ok) { setNewUsername(''); setNewPassword(''); loadUsers(); }
    setAddLoading(false);
  };

  const handleDelete = async (id: number, username: string) => {
    if (!confirm(`למחוק את המשתמש "${username}"?`)) return;
    const res = await fetch(`/api/settings/users/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (res.ok) loadUsers();
    else alert(data.error);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">⚙️ הגדרות</h1>

      {/* Change Password */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">🔑 שינוי סיסמה</h2>
        <form onSubmit={handleChangePassword} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">סיסמה נוכחית</label>
            <input type="password" value={cpCurrent} onChange={e => setCpCurrent(e.target.value)} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">סיסמה חדשה</label>
            <input type="password" value={cpNew} onChange={e => setCpNew(e.target.value)} required minLength={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">אישור סיסמה חדשה</label>
            <input type="password" value={cpConfirm} onChange={e => setCpConfirm(e.target.value)} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          {cpMsg && (
            <div className={`text-sm px-3 py-2 rounded-lg border ${cpMsg.ok ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
              {cpMsg.text}
            </div>
          )}
          <button type="submit" disabled={cpLoading}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            {cpLoading ? 'שומר...' : 'עדכן סיסמה'}
          </button>
        </form>
      </div>

      {/* Users list */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">👥 משתמשים</h2>
        <div className="space-y-2 mb-6">
          {users.map(u => (
            <div key={u.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-800">{u.username}</span>
              <button onClick={() => handleDelete(u.id, u.username)}
                className="text-red-500 hover:text-red-700 text-xs px-2 py-1 rounded hover:bg-red-50">
                מחק
              </button>
            </div>
          ))}
        </div>

        <h3 className="text-sm font-semibold text-gray-600 mb-3">הוספת משתמש חדש</h3>
        <form onSubmit={handleAddUser} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">שם משתמש</label>
            <input type="text" value={newUsername} onChange={e => setNewUsername(e.target.value)} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">סיסמה</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          {addMsg && (
            <div className={`text-sm px-3 py-2 rounded-lg border ${addMsg.ok ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
              {addMsg.text}
            </div>
          )}
          <button type="submit" disabled={addLoading}
            className="bg-green-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50">
            {addLoading ? 'מוסיף...' : '+ הוסף משתמש'}
          </button>
        </form>
      </div>
    </div>
  );
}
