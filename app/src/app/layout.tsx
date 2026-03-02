import type { Metadata } from 'next';
import { Epilogue } from 'next/font/google';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AgentProvider } from '@/providers/AgentProvider';
import { ChatProvider } from '@/providers/ChatProvider';
import { DashboardProvider } from '@/providers/DashboardProvider';
import { RulesProvider } from '@/providers/RulesProvider';
import './globals.css';

const epilogue = Epilogue({
  variable: '--font-epilogue',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Agency Intelligence',
  description: 'AI-gedreven marketingplatform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body className={`${epilogue.variable} antialiased`}>
        <ErrorBoundary>
          <RulesProvider>
            <AgentProvider>
              <ChatProvider><DashboardProvider>{children}</DashboardProvider></ChatProvider>
            </AgentProvider>
          </RulesProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
