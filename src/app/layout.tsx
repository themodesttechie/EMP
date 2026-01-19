import { Outfit } from 'next/font/google';
import './globals.css';
import "flatpickr/dist/flatpickr.css";
import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';

const outfit = Outfit({
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`${outfit.className} dark:bg-gray-950 antialiased`}>

      <ThemeProvider>
        <SidebarProvider>{children}</SidebarProvider>
      </ThemeProvider>
    </div>
  );
}
