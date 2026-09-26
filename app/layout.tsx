import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SHIPCHECK — Pre-Flight Production Change Verification Agent',
  description:
    'Before you ship a change, let the agent try to break your plan. Powered by Sanity Context & GROQ Multi-Hop Graph Traversal.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#040406] text-[#f2f3f7] min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
