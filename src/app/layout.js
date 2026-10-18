import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "TaskFlow | Project & Task Management",
  description: "Responsive project & task management system for small software teams.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full bg-slate-50">
      <body className="flex min-h-full flex-col font-sans text-slate-800 antialiased">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
            <div className="mx-auto max-w-7xl px-4">
              TaskFlow • 7-Day Full-Stack Challenge • TAQAT / CodeMap Trainees
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
