import React, { Suspense, lazy } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import Seo, { absoluteUrl } from '../../components/seo/Seo';

const HeroSection = lazy(() => import('../../components/home/HeroSection'));
const FeaturesSection = lazy(() => import('../../components/home/FeaturesSection'));
const ListingPreviewSection = lazy(() => import('../../components/home/ListingPreviewSection'));

const Home = () => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "JustRentIt",
    url: absoluteUrl("/"),
    potentialAction: {
      "@type": "SearchAction",
      target: `${absoluteUrl("/products")}?search={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <AppLayout>
      <Seo
        title="Rent Anything Locally"
        description="Discover cameras, camping gear, electronics, party supplies, and more on JustRentIt. Rent from trusted local owners with a seamless marketplace experience."
        path="/"
        keywords={["rental marketplace", "rent products locally", "camera rental", "camping gear rental", "JustRentIt"]}
        jsonLd={jsonLd}
      />
      <Suspense fallback={<div className="h-screen flex items-center justify-center">Loading...</div>}>
        <HeroSection />
        <FeaturesSection />
        <ListingPreviewSection />
      </Suspense>
    </AppLayout>
  );
};

export default Home;
