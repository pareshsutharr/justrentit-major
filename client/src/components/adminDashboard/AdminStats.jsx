// AdminStats.js
import React from 'react';

const AdminStats = ({ stats }) => (
  <div className="admin-stats">
    <h2>Platform Statistics</h2>
    <div className="stats-grid">
      <div className="stat-card">
        <h3>Total Users</h3>
        <p>{stats.totalUsers}</p>
      </div>
      <div className="stat-card">
        <h3>Active Listings</h3>
        <p>{stats.activeListings}</p>
      </div>
      <div className="stat-card">
        <h3>Total Products</h3>
        <p>{stats.totalProducts}</p>
      </div>
      <div className="stat-card">
        <h3>Completed Transactions</h3>
        <p>{stats.totalTransactions}</p>
      </div>
    </div>
  </div>
);

export default AdminStats;