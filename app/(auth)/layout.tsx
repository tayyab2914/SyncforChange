export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f6f3f2] px-4 py-16">
      {children}
    </main>
  );
}
