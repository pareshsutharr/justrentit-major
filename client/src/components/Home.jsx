import React from "react";
import Header from "./Header";
import Footer from "./Footer";
// import PublicProduct from "./PublicProduct";
import LocationSection from "./LocationSection";
// import FHome from "./filter/FHome";
import CategoriesComponent from "./products/filter/CategoriesComponent";
import ImageSlider from "./ImageSlider";
// import HomePage from "./HomePage";
// import JustRentItLanding from "./JustRentItLanding";
// import LandingPage from "./Landing/Landingpage";
// import FiltersComponent from "./filter/FiltersComponent";

function Home() {
  return (
    <>
      <Header />
      <LocationSection />
      <CategoriesComponent/>
      {/* <HomePage/> */}
      {/* <LandingPage/> */}
      {/* <FHome/> */} 
      {/* <ImageSlider/> */}
      {/* <FilterSidebar/> */}
      {/* <CategoriesComponent/> */}
      <Footer />
    </>
  );
}

export default Home;
