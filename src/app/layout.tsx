import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "diegocodes.com.br",
    template: "%s · diegocodes.com.br",
  },
  description: "Workspace Diego Codes para vagas, currículos e prospecção comercial.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        {children}
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: { background: "#171717", borderColor: "#2b2b2b", color: "#f5f5f5" },
          }}
        />
      </body>
    </html>
  );
}
