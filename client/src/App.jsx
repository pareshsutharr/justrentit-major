import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import LoadingPage from './components/loadingpages/LoadingPage';
import CategoriesComponent from './components/products/filter/CategoriesComponent';
// import SearchResults from './components/SearchResults';
// import axios from 'axios';
// Lazy loading components
const SignUp = lazy(() => import('./components/authentication/SignUp'));
const LogIn = lazy(() => import('./components/authentication/LogIn'));
const UserProfiles = lazy(() => import('./components/UserProfiles'));
const Home = lazy(() => import('./components/Home'));
const AboutPage = lazy(() => import('./components/AboutPage'));
const Dashboard = lazy(() => import('./components/dashboard/Dashboard'));
const ProductView = lazy(() => import('./components/ProductView'));

import { MantineProvider } from '@mantine/core';
import AdminDashboard from './components/AdminDashboard/AdminDashboard';
// Fallback Component
const Loading = () => <div><LoadingPage/></div>;
function App() {
  return (
    <MantineProvider>
    <BrowserRouter>
      <Suspense fallback={<LoadingPage/>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<SignUp />} />
          <Route path="/profile" element={<UserProfiles />} />
          <Route path="/products" element={<CategoriesComponent />} />
          <Route path="/product/:id" element={<ProductView />} />
          <Route path="/login" element={<LogIn />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />

          <Route path="*" element={<Home />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
    </MantineProvider>
  );
}

export default App;