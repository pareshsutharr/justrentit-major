import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { Pencil, Camera, Mail, Phone, MapPin, User, Loader2, ShieldCheck, Trash2, X, Check } from 'lucide-react';
import { getImageUrl } from '../utils/productHelpers';

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
  <div className="flex items-center gap-4 py-4 border-b border-slate-50 last:border-0 group">
    <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-50 transition-colors">
      <Icon size={18} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
    </div>
    <div className="flex-grow">
      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">{label}</p>
      <p className="text-sm text-slate-900 font-bold tracking-tight">{value || <span className="text-slate-300 font-medium italic">Unspecified</span>}</p>
    </div>
  </div>
);

const Field = ({ label, children, error }) => (
  <div className="space-y-2">
    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest px-1">{label}</label>
    {children}
    {error && <p className="text-[10px] font-bold text-red-500 mt-1 px-1 tracking-tight">{error}</p>}
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
        let profilePayload = null;

        try {
          const { data } = await axios.get(`${baseUrl}/api/users/profile`, {
            params: { userId: storedUser._id },
          });
          if (data?.success && data.user) {
            profilePayload = data.user;
          }
        } catch (error) {
          if (error?.response?.status !== 404) throw error;
        }

        if (!profilePayload) {
          const { data } = await axios.get(`${baseUrl}/api/user/${storedUser._id}`);
          if (data?.success && data.user) {
            profilePayload = data.user;
          }
        }

        if (profilePayload) {
          setUser(profilePayload);
          setFormData({
            address: profilePayload.address || '',
            phone: profilePayload.phone || '',
            profilePhoto: null,
          });
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
    if (name === 'phone' && value && !/^\d{10}$/.test(value)) error = 'Phone must be 10 digits';
    if (name === 'address' && value && value.trim().length < 5) error = 'Address must be at least 5 characters';
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
      const { data: resp } = await axios.post(`${baseUrl}/api/users/profile/update`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (resp.success) {
        setUser(resp.user);
        localStorage.setItem('user', JSON.stringify(resp.user));
        setIsEditing(false);
        setPhotoPreview('');
        toast.success('Your profile is secured and updated.');
      }
    } catch {
      toast.error('Sync failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Authentication required.');
      return;
    }

    if (deleteConfirmation !== 'DELETE') {
      toast.error('Type DELETE to verify.');
      return;
    }

    if (requiresPasswordForDeletion && !currentPassword.trim()) {
      toast.error('Password is required for security.');
      return;
    }

    try {
      setDeletingAccount(true);
      let response;
      try {
        response = await axios.delete(`${baseUrl}/api/users/account`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: {
            confirmation: deleteConfirmation,
            currentPassword,
          },
        });
      } catch (error) {
        if (error?.response?.status !== 404) throw error;
        response = await axios.delete(`${baseUrl}/api/account`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: {
            confirmation: deleteConfirmation,
            currentPassword,
          },
        });
      }

      const { data } = response;

      if (data.success) {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('user');
        toast.success('Account terminated.');
        navigate('/login');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed.');
    } finally {
      setDeletingAccount(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-6 bg-white min-h-[60vh]">
        <div className="relative">
          <div className="w-16 h-16 rounded-[2rem] border-4 border-indigo-50 border-t-indigo-600 animate-spin" />
          <Loader2 size={24} className="absolute inset-0 m-auto text-indigo-600 animate-pulse" />
        </div>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Constructing Workspace...</p>
      </div>
    );
  }

  if (!user) return null;

  const avatarSrc = photoPreview || getImageUrl(user.profilePhoto) || '';

  return (
    <div className="relative pb-24">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-50/30 blur-[100px] rounded-full -z-10" />

      <ToastContainer position="bottom-right" autoClose={3000} theme="light" />

      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-sm font-bold tracking-widest text-indigo-600 uppercase mb-3 px-1">Identity</h1>
          <h2 className="text-4xl font-bold text-slate-900 tracking-tight">Your Profile</h2>
          <p className="text-lg text-slate-500 mt-2 font-medium">Manage your rental credentials and presence.</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-indigo-600 text-white font-bold transition-all hover:bg-indigo-700 hover:-translate-y-1 shadow-xl shadow-indigo-100 active:translate-y-0"
          >
            <Pencil size={16} />
            Edit Profile
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Avatar Sidebar */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-premium p-10 flex flex-col items-center text-center relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-cyan-500" />

          <div className="relative mb-8">
            <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden bg-slate-50 border-4 border-white shadow-xl flex items-center justify-center transform group-hover:scale-105 transition-transform duration-500">
              {avatarSrc ? (
                <img src={avatarSrc} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <User size={48} className="text-slate-300" />
              )}
            </div>
            {isEditing && (
              <label className="absolute -bottom-2 -right-2 w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center cursor-pointer shadow-xl hover:bg-indigo-700 transition-all hover:scale-110 active:scale-95">
                <Camera size={20} />
                <input type="file" accept="image/*" onChange={handlePhotoChange} className="sr-only" />
              </label>
            )}
          </div>

          <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">{user.name}</h2>
          <p className="text-sm text-slate-400 font-medium mb-6 uppercase tracking-widest">{user.email}</p>

          <div className="w-full pt-6 border-t border-slate-50 flex flex-col gap-3">
            {user.role && (
              <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-2xl bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-widest border border-indigo-100">
                <ShieldCheck size={14} />
                {user.role} Verified
              </div>
            )}
            <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-2xl bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-widest border border-emerald-100">
              <Check size={14} /> Account Active
            </div>
          </div>
        </div>

        {/* Main Details Area */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-premium p-10">
            {!isEditing ? (
              <>
                <div className="mb-10 flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">Personal Information</h3>
                    <p className="text-sm text-slate-400 font-medium mt-1">Data visible to owners and renters.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                  <InfoRow icon={User} label="Display Name" value={user.name} />
                  <InfoRow icon={Mail} label="Contact Email" value={user.email} />
                  <InfoRow icon={Phone} label="Verified Phone" value={user.phone} />
                  <InfoRow icon={MapPin} label="Service Address" value={user.address} />
                </div>
              </>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="mb-10">
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">Modify Identity</h3>
                  <p className="text-sm text-slate-400 font-medium mt-1">Update your details to maintain trust.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Field label="Phone Number" error={validation.phone}>
                    <div className="relative group">
                      <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                      <input
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="10-digit mobile"
                        className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border text-sm font-medium outline-none transition-all
                          ${validation.phone
                            ? "border-red-200 focus:ring-4 focus:ring-red-50 bg-red-50/10"
                            : "border-slate-100 bg-slate-50/50 focus:border-indigo-200 focus:ring-4 focus:ring-indigo-50/50"
                          }`}
                      />
                    </div>
                  </Field>

                  <Field label="Mailing Address" error={validation.address}>
                    <div className="relative group">
                      <MapPin size={18} className="absolute left-4 top-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="Your residential address"
                        className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border text-sm font-medium outline-none resize-none transition-all
                          ${validation.address
                            ? "border-red-200 focus:ring-4 focus:ring-red-50 bg-red-50/10"
                            : "border-slate-100 bg-slate-50/50 focus:border-indigo-200 focus:ring-4 focus:ring-indigo-50/50"
                          }`}
                      />
                    </div>
                  </Field>
                </div>

                <div className="flex items-center gap-4 mt-12 pt-8 border-t border-slate-50">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-10 py-3.5 rounded-2xl bg-indigo-600 text-white font-bold text-sm transition-all shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-0.5 disabled:opacity-60 flex items-center gap-2"
                  >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                    {saving ? "Saving Changes…" : "Update Profile"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsEditing(false); setPhotoPreview(''); }}
                    className="px-8 py-3.5 rounded-2xl border border-slate-100 text-sm font-bold text-slate-400 hover:bg-slate-50 transition-colors flex items-center gap-2"
                  >
                    <X size={16} /> Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="bg-white rounded-[2.5rem] border border-red-50 shadow-premium p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-50/30 blur-3xl rounded-full -z-10" />

            <div className="mb-8 items-start flex justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">Security Zone</h3>
                <p className="text-sm text-slate-400 font-medium mt-1">Permanent actions concerning your account.</p>
              </div>
              <div className="px-3 py-1 bg-red-50 text-red-600 text-[10px] font-bold uppercase tracking-widest rounded-lg border border-red-100">
                Danger Zone
              </div>
            </div>

            <p className="text-sm text-slate-500 font-medium leading-relaxed mb-10 max-w-xl">
              Deleting your account will remove all listings, active rentals, and historical data. This action is irreversible.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <Field label='Confirmation Code'>
                <input
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder='Type DELETE'
                  className='w-full px-5 py-3.5 rounded-2xl border border-slate-100 bg-white text-sm font-medium outline-none focus:ring-4 focus:ring-red-50 focus:border-red-200 transition-all text-red-600 placeholder:text-slate-200'
                />
              </Field>

              {requiresPasswordForDeletion && (
                <Field label='Security Verification'>
                  <div className="relative group">
                    <ShieldCheck size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-500 transition-colors" />
                    <input
                      type='password'
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder='Current Password'
                      className='w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-100 bg-white text-sm font-medium outline-none focus:ring-4 focus:ring-red-50 focus:border-red-200 transition-all'
                    />
                  </div>
                </Field>
              )}
            </div>

            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={deletingAccount}
              className="w-full md:w-auto px-10 py-4 rounded-2xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition-all shadow-xl shadow-red-100 hover:shadow-red-200 flex items-center justify-center gap-3 disabled:opacity-60"
            >
              {deletingAccount ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
              {deletingAccount ? 'Terminating Account…' : 'Delete Permanent Identity'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfiles;
