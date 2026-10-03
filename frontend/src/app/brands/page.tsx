'use client';

import BrowseByBrand from '@/components/sections/BrowseByBrand';

export default function BrandsPage() {
  return (
    <main style={{ background: 'var(--white)' }}>
      <BrowseByBrand
        showBreadcrumb
        title="All Car Brands in UAE"
        subtitle="Browse official manufacturers, view model line-ups and explore verified pricing."
        showViewAll={false}
        showTabs={false}
      />
    </main>
  );
}

