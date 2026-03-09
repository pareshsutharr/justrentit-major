import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoadingPage from './components/loadingpages/LoadingPage';

// Basic AppLayout wrappers for other generic routes (to be updated later)
import AppLayout from './components/layout/AppLayout';

// New Next.js-like Pages structure
const Home = lazy(() => import('./pages/home/Home'));

// Old components (to be refactored to pages later)
const SignUp = lazy(() => import('./components/authentication/SignUp'));
const LogIn = lazy(() => import('./components/authentication/LogIn'));
const UserProfiles = lazy(() => import('./components/UserProfiles'));
const CategoriesComponent = lazy(() => import('./components/products/filter/CategoriesComponent'));
const AboutPage = lazy(() => import('./components/AboutPage'));
const Dashboard = lazy(() => import('./components/dashboard/Dashboard'));
const AdminDashboard = lazy(() => import('./components/adminDashboard/AdminDashboard'));
const SearchPage = lazy(() => import('./pages/search/SearchPage'));
const FavoritesPage = lazy(() => import('./pages/favorites/FavoritesPage'));

const ProductPage = lazy(() => import('./pages/product/ProductPage'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingPage/>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<SearchPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          
          {/* Wrapped legacy routes in AppLayout for consistency during refactor */}
          <Route path="/register" element={<AppLayout><SignUp /></AppLayout>} />
          <Route path="/profile" element={<AppLayout><UserProfiles /></AppLayout>} />
          <Route path="/login" element={<AppLayout><LogIn /></AppLayout>} />
          <Route path="/about" element={<AppLayout><AboutPage /></AppLayout>} />
          <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
          <Route path="/admin" element={<AdminDashboard />} />

          <Route path="*" element={<Home />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
