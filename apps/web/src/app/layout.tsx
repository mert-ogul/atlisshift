import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AtlasShift - Architecture-level Code Migrations',
  description: 'Safe, architecture-level code transformations with automatic invariant mining',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
