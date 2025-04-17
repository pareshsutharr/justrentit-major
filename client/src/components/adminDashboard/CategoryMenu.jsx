import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap
const baseUrl = import.meta.env.VITE_API_BASE_URL;
const CategoryMenu = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [updatedName, setUpdatedName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${baseUrl}/api/categories`);
      setCategories(data);
    } catch (error) {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return toast.warning("Enter a category name!");
    setLoading(true);
    try {
      const { data } = await axios.post(`${baseUrl}/api/categories`, { name: newCategory });
      setCategories([data, ...categories]);
      setNewCategory("");
      toast.success("Category added!");
    } catch (error) {
      toast.error("Error adding category");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCategory = async (id) => {
    if (!updatedName.trim()) return;
    setLoading(true);
    try {
      const { data } = await axios.put(`${baseUrl}/api/categories/${id}`, { name: updatedName });
      setCategories(categories.map(cat => (cat._id === id ? data : cat)));
      setEditingId(null);
      toast.success("Category updated!");
    } catch (error) {
      toast.error("Error updating category");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    setLoading(true);
    try {
      await axios.delete(`${baseUrl}/api/categories/${id}`);
      setCategories(categories.filter(cat => cat._id !== id));
      toast.success("Category deleted!");
    } catch (error) {
      toast.error("Error deleting category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="card shadow-lg">
        <div className="card-body">
          <h2 className="card-title text-center text-primary">Manage Categories</h2>

          {/* Add Category Input */}
          <div className="input-group my-4">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Enter category name"
              className="form-control"
              onKeyPress={(e) => e.key === "Enter" && handleAddCategory()}
            />
            <button
              onClick={handleAddCategory}
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? "Adding..." : "Add"}
            </button>
          </div>

          {/* Categories List */}
          {loading ? (
            <p className="text-center text-muted">Loading categories...</p>
          ) : (
            <ul className="list-group">
              {categories.map((category) => (
                <li key={category._id} className="list-group-item d-flex justify-content-between align-items-center">
                  {editingId === category._id ? (
                    <input
                      autoFocus
                      value={updatedName}
                      onChange={(e) => setUpdatedName(e.target.value)}
                      className="form-control me-2"
                      onKeyPress={(e) => e.key === "Enter" && handleUpdateCategory(category._id)}
                    />
                  ) : (
                    <span className="fw-bold text-dark">{category.name}</span>
                  )}

                  <div>
                    {editingId === category._id ? (
                      <>
                        <button
                          onClick={() => handleUpdateCategory(category._id)}
                          disabled={loading}
                          className="btn btn-success btn-sm me-2"
                        >
                          {loading ? "Saving..." : "Save"}
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="btn btn-secondary btn-sm"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setEditingId(category._id);
                            setUpdatedName(category.name);
                          }}
                          className="btn btn-warning btn-sm me-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category._id)}
                          className="btn btn-danger btn-sm"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
};

export default CategoryMenu;
