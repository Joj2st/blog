import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../styles/globals.css';
import { cn } from "@/lib/utils";
import { PopupNotification } from '@/components/PopupNotification';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Blog Platform',
  description: 'A modern blog platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className={cn("font-sans", inter.variable)}>
      <body className={cn(inter.className, "bg-white dark:bg-gray-950 text-gray-900 dark:text-white transition-colors")}>
        {children}
        <PopupNotification />
      </body>
    </html>
  );
}
