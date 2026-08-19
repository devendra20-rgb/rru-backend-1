import HeroSection from '@/components/sections/HeroSection';
import BrowseHubs from '@/components/sections/BrowseHubs';
import FeaturedCars from '@/components/sections/FeaturedCars';
import BrowseByBrand from '@/components/sections/BrowseByBrand';
import ComparePreview from '@/components/sections/ComparePreview';
import CostToOwnPreview from '@/components/sections/CostToOwnPreview';
import AIAssistantPreview from '@/components/sections/AIAssistantPreview';
import ReviewsPreview from '@/components/sections/ReviewsPreview';
import CommunityPoll from '@/components/sections/CommunityPoll';
import NewsPreview from '@/components/sections/NewsPreview';
import WhyRRU from '@/components/sections/WhyRRU';
import FinalCTA from '@/components/sections/FinalCTA';

export default function HomePage() {
  return (
    <>
      {/* 02 — Hero / Top Section */}
      <HeroSection />

      {/* 03 — Browse Hubs */}
      <BrowseHubs />

      {/* 04 — Featured Cars */}
      <FeaturedCars />

      {/* 05 — Browse by Brand */}
      <BrowseByBrand />

      {/* 06 — Compare */}
      <ComparePreview />

      {/* 07 — Cost to Own */}
      <CostToOwnPreview />

      {/* 08 — Ask RideIQ (AI Assistant) */}
      <AIAssistantPreview />

      {/* 09 — Reviews */}
      <ReviewsPreview />

      {/* 10 — Community Poll */}
      <CommunityPoll />

      {/* 11 — News & Blogs */}
      <NewsPreview />

      {/* 12 — Why RRU */}
      <WhyRRU />

      {/* 13 — Final CTA */}
      <FinalCTA />
    </>
  );
}
