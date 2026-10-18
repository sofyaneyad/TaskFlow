import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "TaskFlow | Project & Task Management",
  description: "Responsive project & task management system for small software teams.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" className="h-full bg-[#FBFAFC]">
      <body className="flex min-h-full flex-col font-sans text-[#0F172A] antialiased">
        <LanguageProvider>
          <AuthProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <footer className="border-t border-[#E2E8F0] bg-white py-6 text-center text-xs text-[#64748B]">
              <div className="mx-auto max-w-7xl px-4">
                TaskFlow • 7-Day Full-Stack Challenge • TAQAT / CodeMap Trainees
              </div>
            </footer>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
