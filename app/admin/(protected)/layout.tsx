import AdminSidebar from "@/components/admin/AdminSidebar";

export default function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AdminSidebar />
      <div className="lg:ml-64 min-h-screen">{children}</div>
    </>
  );
}
