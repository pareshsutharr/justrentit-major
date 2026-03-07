import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import CategoriesComponent from "./products/filter/CategoriesComponent";
import "./Home.css";

function Home() {
  return (
    <div className="home-page">
      <Header />
      <CategoriesComponent/>
      <Footer />
    </div>
  );
}

export default Home;
