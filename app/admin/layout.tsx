import AdminHeader from '@/components/AdminHeader';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--background-soft)' }}>
      <AdminHeader />
      {children}
    </div>
  );
}
