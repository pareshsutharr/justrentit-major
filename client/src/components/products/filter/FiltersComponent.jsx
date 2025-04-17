// import React, { useState } from "react";
// import "bootstrap/dist/css/bootstrap.min.css";
// import "./FiltersComponent.css";

// const FiltersComponent = ({
//   categories,
//   onFilterChange,
//   currentFilters,
//   onSearch,
//   searchQuery,
// }) => {
//   const [showFilters, setShowFilters] = useState(false);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     onFilterChange({ [name]: value });
//   };

//   const handleSearchChange = (e) => {
//     const query = e.target.value;
//     onSearch(query);
//   };

//   return (
//     <div
//       className="main"
//       style={{
//         // background: "red",
//         height: "content",
//         padding: "30px auto",
//         // backgroundImage: "url(images/bg.jpg)",
//         maxWidth: "1500px",

//         display: "",
//         justifySelf: "center",
//         width: "100%",
//         overflow: "hidden",
//         backgroundRepeat: "no-repeat",
//         backgroundSize: "cover",
//         justifyContent:'space-between'
//       }}
//     >
//       <div className="text-center" style={{paddingTop:'50px'}} >
//           <h1 className="display-4 fw-bold text-gradient-primary">Discover Rentals Near You</h1>
//           <p className="lead text-muted">Find perfect items for your needs</p>
//         </div>
//       <div style={{ padding: "40px 120px 120px 120px", justifyContent: "space-between" ,zIndex:'5',outline:'none',borderRadius:'none'} }>

//         <div className="container-search filter-container" style={{borderRadius:'70px',padding:'15px',border:'2px solid gray'}}>
//           {/* Search Field */}
//           <div className="search-box" style={{padding:'0px'}}>
//             <input
//               type="text"
//               placeholder="🔍 Search by product name..."
//               value={searchQuery}
//               style={{padding: "20px",fontSize: '20px',outline:'none',textDecoration:'none',hoverBackground:'none',border:'none'}}
//               onChange={handleSearchChange}
//               className="form-control"
//             />

//             {/* Toggle Filters Button */}
//             {/* <div className="text-center mt-3"> */}
//             <button
//               className="btn btn-primary filter-toggle-btn " style={{borderRadius:'50px',padding: '20px'}}
//               onClick={() => setShowFilters(!showFilters)}
//             >
//               {showFilters ? "Filters ▲" : "Filters ▼"}
//             </button>
//           </div>

//           {/* Filters Section (Hidden by Default) */}
//           {showFilters && (
//             <div className="row mt-4 p-4">
//               {/* Category Filter */}
//               <div className="col-md-3">
//                 <label className="form-label">Category</label>
//                 <select
//                   name="categoryId"
//                   value={currentFilters.categoryId}
//                   onChange={handleInputChange}
//                   className="form-select"
//                 >
//                   <option value="">All Categories</option>
//                   {categories.map((category) => (
//                     <option key={category._id} value={category._id}>
//                       {category.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {/* Price Range Filters */}
//               <div className="col-md-3">
//                 <label className="form-label">Min Price</label>
//                 <input
//                   type="number"
//                   name="minPrice"
//                   value={currentFilters.minPrice}
//                   onChange={handleInputChange}
//                   className="form-control"
//                   placeholder="Min"
//                 />
//               </div>
//               <div className="col-md-3">
//                 <label className="form-label">Max Price</label>
//                 <input
//                   type="number"
//                   name="maxPrice"
//                   value={currentFilters.maxPrice}
//                   onChange={handleInputChange}
//                   className="form-control"
//                   placeholder="Max"
//                 />
//               </div>

//               {/* State Filter */}
//               <div className="col-md-3">
//                 <label className="form-label">State</label>
//                 <input
//                   type="text"
//                   name="state"
//                   value={currentFilters.state}
//                   onChange={handleInputChange}
//                   className="form-control"
//                   placeholder="Enter state"
//                 />
//               </div>

//               {/* Condition Filter */}
//               <div className="col-md-3">
//                 <label className="form-label">Condition</label>
//                 <select
//                   name="condition"
//                   value={currentFilters.condition}
//                   onChange={handleInputChange}
//                   className="form-select"
//                 >
//                   <option value="">All Conditions</option>
//                   <option value="new">New</option>
//                   <option value="used">Used</option>
//                   <option value="excellent">Excellent</option>
//                   <option value="good">Good</option>
//                   <option value="fair">Fair</option>
//                 </select>
//               </div>

//               {/* Rental Duration Filter */}
//               <div className="col-md-3">
//                 <label className="form-label">Rental Duration</label>
//                 <select
//                   name="rentalDuration"
//                   value={currentFilters.rentalDuration}
//                   onChange={handleInputChange}
//                   className="form-select"
//                 >
//                   <option value="">All Durations</option>
//                   <option value="hour">Hour</option>
//                   <option value="day">Day</option>
//                   <option value="week">Week</option>
//                   <option value="month">Month</option>
//                 </select>
//               </div>

//               {/* Reset Filters Button */}
//               <div className="col-md-3 text-left mt-4">
//                 <button
//                   onClick={() => {
//                     onFilterChange({
//                       categoryId: "",
//                       minPrice: "",
//                       maxPrice: "",
//                       state: "",
//                       condition: "",
//                       rentalDuration: "",
//                     });
//                     onSearch("");
//                   }}
//                   className="btn btn-danger reset-btn"
//                 >
//                   Reset Filters
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default FiltersComponent;












import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./FiltersComponent.css";

const FiltersComponent = ({
  categories,
  onFilterChange,
  currentFilters,
  onSearch,
  searchQuery,
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({ [name]: value });
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    onSearch(query);
  };

  return (
    <div className="main-container">
      <div className="header-text">
        <h1 className="display-4 fw-bold title">Discover Rentals Near you</h1>
        <p className="lead subtitle">Find perfect items for your needs</p>
      </div>
      
      <div className="filters-wrapper">
        <div className="container-search filter-container">
          <div className="search-box">
            <input
              type="text"
              placeholder="🔍 Search by product name..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="search-input"
            />
            <button
              className="btn btn-primary filter-toggle"
              style={{padding:'20px',borderRadius:'50px',  width:'30vh'}}
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? "Filters ▲" : "Filters ▼"}
            </button>
          </div>

          {showFilters && (
            <div className="row mt-4 p-4">
              {/* Category Filter */}
              <div className="col-md-3">
                <label className="form-label">Category</label>
                <select
                  name="categoryId"
                  value={currentFilters.categoryId}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range Filters */}
              <div className="col-md-3">
                <label className="form-label">Min Price</label>
                <input
                  type="number"
                  name="minPrice"
                  value={currentFilters.minPrice}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Min"
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Max Price</label>
                <input
                  type="number"
                  name="maxPrice"
                  value={currentFilters.maxPrice}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Max"
                />
              </div>

              {/* State Filter */}
              <div className="col-md-3">
                <label className="form-label">State</label>
                <input
                  type="text"
                  name="state"
                  value={currentFilters.state}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Enter state"
                />
              </div>

              {/* Condition Filter */}
              <div className="col-md-3">
                <label className="form-label">Condition</label>
                <select
                  name="condition"
                  value={currentFilters.condition}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="">All Conditions</option>
                  <option value="new">New</option>
                  <option value="used">Used</option>
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                </select>
              </div>

              {/* Rental Duration Filter */}
              <div className="col-md-3">
                <label className="form-label">Rental Duration</label>
                <select
                  name="rentalDuration"
                  value={currentFilters.rentalDuration}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="">All Durations</option>
                  <option value="hour">Hour</option>
                  <option value="day">Day</option>
                  <option value="week">Week</option>
                  <option value="month">Month</option>
                </select>
              </div>

              {/* Reset Filters Button */}
              <div className="col-md-3 text-left mt-4">
                <button
                  onClick={() => {
                    onFilterChange({
                      categoryId: "",
                      minPrice: "",
                      maxPrice: "",
                      state: "",
                      condition: "",
                      rentalDuration: "",
                    });
                    onSearch("");
                  }}
                  className="btn btn-danger reset-btn"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          )}
        
        </div>
      </div>
    </div>
  );
};

export default FiltersComponent;

