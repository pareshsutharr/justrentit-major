// components/AdminDashboard/UserManagement.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { TailSpin } from "react-loader-spinner";
import {
  MagnifyingGlass,
  Trash,
  UserSwitch,
  ShieldWarning,
  UserCircleGear,
  ShieldCheck,
} from "phosphor-react";
import "./UserManagement.css";
import LoadingPage from "../loadingpages/LoadingPage";
const baseUrl = import.meta.env.VITE_API_BASE_URL;
const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
const [filterRole, setFilterRole] = useState('all');
const [filterStatus, setFilterStatus] = useState('all');


  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${baseUrl}/api/admin/users?search=${searchTerm}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers(response.data);
      setError("");
    } catch (err) {
      showErrorAlert("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchUsers();
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const showSuccessAlert = (message) => {
    Swal.fire({
      icon: "success",
      title: "Success!",
      text: message,
      showConfirmButton: false,
      timer: 2000,
      background: "#f8fafc",
      iconColor: "#10b981",
    });
  };

  const showErrorAlert = (message) => {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: message,
      confirmButtonColor: "#3b82f6",
      background: "#f8fafc",
    });
  };

  const handleRoleChange = async (userId, newRole) => {
    const result = await Swal.fire({
      title: "Change User Role?",
      text: `Are you sure you want to change this user's role to ${newRole}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3b82f6",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, change it!",
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.put(
             `${baseUrl}/api/admin/users/${userId}/role`,
          { role: newRole },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setUsers(
          users.map((user) =>
            user._id === userId ? { ...user, role: response.data.role } : user
          )
        );
        showSuccessAlert("User role updated successfully");
      } catch (err) {
        showErrorAlert("Failed to update user role");
      }
    }
  };

  const handleDelete = async (userId) => {
    const result = await Swal.fire({
      title: "Delete User?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${baseUrl}/api/admin/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(users.filter((user) => user._id !== userId));
        showSuccessAlert("User deleted successfully");
      } catch (err) {
        showErrorAlert("Failed to delete user");
      }
    }
  };

  const handleVerifyUser = async (userId, verifyStatus) => {
    const result = await Swal.fire({
      title: verifyStatus ? "Verify User?" : "Unverify User?",
      text: verifyStatus
        ? "This will grant full access to the user"
        : "This will restrict some user privileges",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3b82f6",
      cancelButtonColor: "#64748b",
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.put(
             `${baseUrl}/api/admin/users/${userId}/verify`,
          { verified: verifyStatus },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setUsers(
          users.map((user) =>
            user._id === userId ? { ...user, isVerified: verifyStatus } : user
          )
        );
        showSuccessAlert(
          `User ${verifyStatus ? "verified" : "unverified"} successfully`
        );
      } catch (err) {
        showErrorAlert("Failed to update verification status");
      }
    }
  };
  // Add bulk verification handler
const handleBulkVerify = async (verifyStatus) => {
  if (selectedUsers.length === 0) return;

  const result = await Swal.fire({
    title: `${verifyStatus ? 'Verify' : 'Unverify'} ${selectedUsers.length} users?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3b82f6',
    cancelButtonColor: '#64748b',
  });

  if (result.isConfirmed) {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${baseUrl}/api/admin/users/bulk-verify`,
        { userIds: selectedUsers, verified: verifyStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setUsers(users.map(user => 
        selectedUsers.includes(user._id) ? { ...user, isVerified: verifyStatus } : user
      ));
      setSelectedUsers([]);
      showSuccessAlert(`${selectedUsers.length} users updated`);
    } catch (err) {
      showErrorAlert('Bulk update failed');
    }
  }
};

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">
              User Management
            </h1>
          </div>

          <div
            className="relative w-full md:w-96"
            style={{
              background: "whitesmoke",
              borderRadius: "40px",
              marginBottom: "20px",
              border: "1px solid black",
            }}
          >
            <input
              type="text"
              placeholder="Search users by name, email, or phone..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
              value={searchTerm}
              style={{
                borderRadius: "40px",
                fontSize: "12px",
                width: "90%",
                paddingLeft: "10px",
              }}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <MagnifyingGlass
              className="absolute left-4 top-3.5 text-gray-400"
              size={24}
              color="green"
              style={{
                width: "10%",
                height: "50px",
                paddingTop: "10px",
                paddingBottom: "10px",
              }}
              weight="duotone"
            />
          </div>
        </div>
       

        {/* Content Section */}
        {loading ? (
          <LoadingPage />
        ) : error ? (
          <div className="text-center p-8 bg-red-50 rounded-xl">
            <ShieldWarning className="mx-auto text-red-500 mb-4" size={48} />
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            {/* Desktop Table */}
            <table className="hidden md:table min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-4">
                        <img
                          className="h-10 w-10 rounded-full object-cover border-2 border-white shadow"
                          src={
                               `${baseUrl}` + user.profilePhoto ||
                            "/default-avatar.png"
                          }
                          alt={user.name}
                          height={"50px"}
                          width={"50px"}
                          style={{ borderRadius: "50%" }}
                        />
                        <div>
                          <div className="font-medium text-gray-900">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            Joined{" "}
                            {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900">{user.email}</div>
                      <div className="text-sm text-gray-500">
                        {user.phone || "No phone"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={user.role}
                        onChange={(e) =>
                          handleRoleChange(user._id, e.target.value)
                        }
                        className={`px-3 py-1 rounded-lg border text-sm font-medium focus:outline-none focus:ring-2 ${
                          user.role === "Admin"
                            ? "border-purple-200 bg-purple-50 text-purple-700"
                            : "border-blue-200 bg-blue-50 text-blue-700"
                        }`}
                      >
                        <option value="User">User</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                            user.isVerified
                              ? "bg-green-100 text-green-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {user.isVerified ? "Verified" : "Pending"}
                        </div>
                        {!user.isVerified && (
                          <button
                            onClick={() => handleVerifyUser(user._id, true)}
                            className="p-1.5 hover:bg-green-50 rounded-lg transition-colors text-green-600 hover:text-green-700"
                            title="Verify User"
                          >
                            <ShieldCheck size={20} weight="duotone" />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-500 hover:text-red-700"
                        aria-label="Delete user"
                      >
                        <Trash size={24} weight="duotone" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
