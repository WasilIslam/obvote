'use client';

import { useState, useEffect } from 'react';
import { FiUsers, FiMail, FiPhone, FiHome, FiCalendar, FiCheck, FiX, FiSearch, FiDownload } from 'react-icons/fi';

interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  unitId: string | null;
  unitIdentifier: string | null;
  registrationCode: string | null;
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchUsers();

    // Check for search query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    if (searchParam) {
      setSearchTerm(searchParam);
    }
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users');
      const data = await response.json();

      if (response.ok && data.users) {
        setUsers(data.users);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to fetch users' });
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setMessage({ type: 'error', text: 'Failed to load users' });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.unitIdentifier && user.unitIdentifier.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.registrationCode && user.registrationCode.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const exportToCSV = () => {
    const headers = ['Full Name', 'Email', 'Phone', 'Unit', 'Registration Code', 'Registered Date'];
    const rows = filteredUsers.map((user) => [
      user.fullName,
      user.email,
      user.phone || '',
      user.unitIdentifier || '',
      user.registrationCode || '',
      formatDate(user.createdAt),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#5f6368', fontSize: '16px' }}>
          Loading users...
        </div>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 400, marginBottom: '8px', color: '#202124' }}>
            User Management
          </h1>
          <p style={{ fontSize: '16px', color: '#5f6368', fontWeight: 400 }}>
            View and manage all registered users
          </p>
        </div>
        <button
          onClick={exportToCSV}
          className="btn btn-primary"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          <FiDownload size={16} />
          Export CSV
        </button>
      </div>

      {/* Message */}
      {message && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '24px',
            background: message.type === 'success' ? '#e6f4ea' : '#fce8e6',
            border: `1px solid ${message.type === 'success' ? '#34a853' : '#ea4335'}`,
            color: message.type === 'success' ? '#137333' : '#c5221f',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>{message.text}</span>
          <button
            onClick={() => setMessage(null)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              color: 'inherit',
            }}
          >
            <FiX size={16} />
          </button>
        </div>
      )}

      {/* Search */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ position: 'relative', maxWidth: '500px' }}>
          <FiSearch
            size={18}
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#5f6368' }}
          />
          <input
            type="text"
            placeholder="Search by name, email, unit, or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 12px 12px 40px',
              border: '1px solid #dadce0',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '32px',
        }}
      >
        <div
          style={{
            background: 'white',
            border: '1px solid #e8eaed',
            borderRadius: '12px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <FiUsers size={24} color="#1a73e8" />
          <div style={{ fontSize: '32px', fontWeight: 500, color: '#202124' }}>{users.length}</div>
          <div style={{ fontSize: '14px', color: '#5f6368' }}>Total Users</div>
        </div>
        <div
          style={{
            background: 'white',
            border: '1px solid #e8eaed',
            borderRadius: '12px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <FiHome size={24} color="#34a853" />
          <div style={{ fontSize: '32px', fontWeight: 500, color: '#202124' }}>
            {users.filter((u) => u.unitId).length}
          </div>
          <div style={{ fontSize: '14px', color: '#5f6368' }}>Users with Units</div>
        </div>
        <div
          style={{
            background: 'white',
            border: '1px solid #e8eaed',
            borderRadius: '12px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <FiCheck size={24} color="#fbbc04" />
          <div style={{ fontSize: '32px', fontWeight: 500, color: '#202124' }}>
            {users.filter((u) => u.registrationCode).length}
          </div>
          <div style={{ fontSize: '14px', color: '#5f6368' }}>Used Reg. Codes</div>
        </div>
      </div>

      {/* Users Table */}
      <div style={{ background: 'white', border: '1px solid #e8eaed', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f9fa', borderBottom: '1px solid #e8eaed' }}>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: 500, color: '#5f6368' }}>
                  User
                </th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: 500, color: '#5f6368' }}>
                  Contact
                </th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: 500, color: '#5f6368' }}>
                  Unit
                </th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: 500, color: '#5f6368' }}>
                  Registration Code
                </th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: 500, color: '#5f6368' }}>
                  Registered
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#5f6368' }}>
                    {searchTerm ? 'No users found matching your search' : 'No users registered yet'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} style={{ borderBottom: '1px solid #e8eaed' }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #4285f4 0%, #1a73e8 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '16px',
                            fontWeight: 600,
                            flexShrink: 0,
                          }}
                        >
                          {user.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500, color: '#202124', fontSize: '14px' }}>{user.fullName}</div>
                          <div style={{ fontSize: '12px', color: '#5f6368' }}>ID: {user.id.slice(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}>
                          <FiMail size={14} color="#5f6368" />
                          <a
                            href={`mailto:${user.email}`}
                            style={{ color: '#1a73e8', textDecoration: 'none' }}
                            onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                            onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                          >
                            {user.email}
                          </a>
                        </div>
                        {user.phone && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}>
                            <FiPhone size={14} color="#5f6368" />
                            <span style={{ color: '#5f6368' }}>{user.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      {user.unitId ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <FiHome size={14} color="#34a853" />
                          <span
                            style={{
                              background: '#e6f4ea',
                              color: '#137333',
                              padding: '4px 10px',
                              borderRadius: '12px',
                              fontSize: '13px',
                              fontWeight: 500,
                            }}
                          >
                            {user.unitIdentifier || user.unitId.slice(0, 8)}
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: '#80868b', fontSize: '13px' }}>No unit</span>
                      )}
                    </td>
                    <td style={{ padding: '16px' }}>
                      {user.registrationCode ? (
                        <code
                          style={{
                            background: '#f1f3f4',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '13px',
                            color: '#202124',
                            fontFamily: 'monospace',
                          }}
                        >
                          {user.registrationCode}
                        </code>
                      ) : (
                        <span style={{ color: '#80868b', fontSize: '13px' }}>No code used</span>
                      )}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#5f6368' }}
                      >
                        <FiCalendar size={14} />
                        {formatDate(user.createdAt)}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
