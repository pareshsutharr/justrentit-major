import React, { Suspense, lazy } from 'react';
import AppLayout from '../../components/layout/AppLayout';

const HeroSection = lazy(() => import('../../components/home/HeroSection'));
const FeaturesSection = lazy(() => import('../../components/home/FeaturesSection'));
const ListingPreviewSection = lazy(() => import('../../components/home/ListingPreviewSection'));

const Home = () => {
  return (
    <AppLayout>
      <Suspense fallback={<div className="h-screen flex items-center justify-center">Loading...</div>}>
        <HeroSection />
        <FeaturesSection />
        <ListingPreviewSection />
      </Suspense>
    </AppLayout>
  );
};

export default Home;
