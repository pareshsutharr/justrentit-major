import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { Pencil, Camera, Mail, Phone, MapPin, User, Loader2, ShieldCheck, Trash2 } from 'lucide-react';

const baseUrl = import.meta.env.VITE_API_BASE_URL;

const readStoredUser = () => {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 mt-0.5">
      <Icon size={15} className="text-gray-500" />
    </div>
    <div>
      <p className="text-xs text-gray-400 font-medium mb-0.5">{label}</p>
      <p className="text-sm text-gray-800 font-medium">{value || <span className="text-gray-400 font-normal italic">Not provided</span>}</p>
    </div>
  </div>
);

const Field = ({ label, children, error }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
    {children}
    {error && <p className="text-xs text-error mt-1">{error}</p>}
  </div>
);

const UserProfiles = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ address: '', phone: '', profilePhoto: null });
  const [validation, setValidation] = useState({ phone: '', address: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [photoPreview, setPhotoPreview] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);
  const storedAuthUser = readStoredUser();
  const requiresPasswordForDeletion = !storedAuthUser?.googleId;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedUser = readStoredUser();
        if (!storedUser?._id) {
          setLoading(false);
          return;
        }
        const { data } = await axios.get(`${baseUrl}/getUserProfile`, { params: { userId: storedUser._id } });
        if (data.success) {
          const u = data.user;
          setUser(u);
          setFormData({ address: u.address || '', phone: u.phone || '', profilePhoto: null });
        }
      } catch {
        toast.error('Error loading profile');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const validateField = (name, value) => {
    let error = '';
    if (name === 'phone' && !/^\d{10}$/.test(value)) error = 'Phone must be 10 digits';
    if (name === 'address' && value.trim().length < 5) error = 'Address must be at least 5 characters';
    setValidation((prev) => ({ ...prev, [name]: error }));
    return error === '';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, profilePhoto: file }));
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateField('phone', formData.phone) || !validateField('address', formData.address)) return;
    setSaving(true);

    const data = new FormData();
    data.append('userId', user._id);
    data.append('address', formData.address);
    data.append('phone', formData.phone);
    if (formData.profilePhoto) data.append('profilePhoto', formData.profilePhoto);

    try {
      const { data: resp } = await axios.post(`${baseUrl}/updateProfile`, data);
      if (resp.success) {
        setUser(resp.user);
        localStorage.setItem('user', JSON.stringify(resp.user));
        setIsEditing(false);
        setPhotoPreview('');
        toast.success('Profile updated');
      }
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in again to delete your account');
      return;
    }

    if (deleteConfirmation !== 'DELETE') {
      toast.error('Type DELETE to confirm account deletion');
      return;
    }

    if (requiresPasswordForDeletion && !currentPassword.trim()) {
      toast.error('Current password is required');
      return;
    }

    try {
      setDeletingAccount(true);
      const { data } = await axios.delete(`${baseUrl}/api/account`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          confirmation: deleteConfirmation,
          currentPassword,
        },
      });

      if (data.success) {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('user');
        toast.success('Account deleted');
        navigate('/login');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete account');
    } finally {
      setDeletingAccount(false);
    }
  };

  /* ── Loading ─── */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <div className="w-10 h-10 rounded-2xl bg-primary-light flex items-center justify-center">
          <Loader2 size={20} className="text-primary animate-spin" />
        </div>
        <p className="text-sm text-gray-400">Loading profile…</p>
      </div>
    );
  }

  if (!user) return null;

  const avatarSrc = photoPreview || (user.profilePhoto
    ? (user.profilePhoto.startsWith('http') ? user.profilePhoto : `${baseUrl}${user.profilePhoto}`)
    : null);

  return (
    <div>
      <ToastContainer position="bottom-right" autoClose={3000} theme="light" />

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your personal information</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:border-primary hover:text-primary transition-colors"
          >
            <Pencil size={15} />
            Edit Profile
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 flex flex-col items-center text-center">
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-primary-light flex items-center justify-center">
              {avatarSrc ? (
                <img src={avatarSrc} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <User size={36} className="text-primary" />
              )}
            </div>
            {isEditing && (
              <label className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center cursor-pointer shadow-md hover:bg-primary-hover transition-colors">
                <Camera size={14} />
                <input type="file" accept="image/*" onChange={handlePhotoChange} className="sr-only" />
              </label>
            )}
          </div>

          <h2 className="text-base font-bold text-gray-900">{user.name}</h2>
          <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>

          {user.role && (
            <span className="inline-flex items-center gap-1 mt-3 px-2.5 py-1 rounded-full text-xs font-medium bg-primary-light text-primary">
              <ShieldCheck size={12} />
              {user.role}
            </span>
          )}
        </div>

        {/* Details / edit */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-card p-6">
          {!isEditing ? (
            <>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Account Details</h3>
              <p className="text-xs text-gray-400 mb-4">Your personal information stored on JustRentIt</p>
              <div>
                <InfoRow icon={User} label="Full Name" value={user.name} />
                <InfoRow icon={Mail} label="Email Address" value={user.email} />
                <InfoRow icon={Phone} label="Phone Number" value={user.phone} />
                <InfoRow icon={MapPin} label="Address" value={user.address} />
              </div>
            </>
          ) : (
            <form onSubmit={handleSubmit}>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Edit Profile</h3>
              <div className="space-y-4">
                <Field label="Phone Number" error={validation.phone}>
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="10-digit mobile number"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-all
                      ${validation.phone
                        ? "border-error focus:ring-2 focus:ring-error/10"
                        : "border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10"
                      }`}
                  />
                </Field>

                <Field label="Address" error={validation.address}>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Your full address"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none resize-none transition-all
                      ${validation.address
                        ? "border-error focus:ring-2 focus:ring-error/10"
                        : "border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10"
                      }`}
                  />
                </Field>
              </div>

              <div className="flex items-center gap-3 mt-6">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-semibold transition-all disabled:opacity-60"
                >
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  {saving ? "Saving…" : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => { setIsEditing(false); setPhotoPreview(''); }}
                  className="px-6 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <div className="mt-6 bg-white rounded-2xl border border-red-100 shadow-card p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Delete Account</h3>
        <p className="text-xs text-gray-500 mb-4">
          This permanently removes your profile, products, rental requests, chats and related records.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label='Type DELETE to confirm'>
            <input
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder='DELETE'
              className='w-full px-3.5 py-2.5 rounded-xl border border-red-200 text-sm outline-none focus:ring-2 focus:ring-red-100'
            />
          </Field>

          {requiresPasswordForDeletion && (
            <Field label='Current Password'>
              <input
                type='password'
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder='Enter your current password'
                className='w-full px-3.5 py-2.5 rounded-xl border border-red-200 text-sm outline-none focus:ring-2 focus:ring-red-100'
              />
            </Field>
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={handleDeleteAccount}
            disabled={deletingAccount}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60"
          >
            {deletingAccount ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
            {deletingAccount ? 'Deleting Account…' : 'Delete My Account'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfiles;
