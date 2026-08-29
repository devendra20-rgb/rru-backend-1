import type { Metadata } from 'next';
import { SITE_NAME, SITE_DESCRIPTION } from '@/lib/constants';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { CompareProvider } from '@/hooks/useCompare';
import CompareFloatingBar from '@/components/ui/CompareFloatingBar';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} — Find the right car. Know what it really costs.`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: ['cars', 'UAE', 'Dubai', 'car comparison', 'cost to own', 'new cars', 'automotive'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <CompareProvider>
          <div className="page-container" suppressHydrationWarning>
            <Navbar />
            <main>{children}</main>
            <Footer />
            <CompareFloatingBar />
          </div>
        </CompareProvider>
      </body>
    </html>
  );
}
