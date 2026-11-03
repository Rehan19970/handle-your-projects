import { useState, useRef } from 'react';
import { User, Moon, Sun, Lock, ShieldCheck, KeyRound, Camera } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '../../../lib/axios';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useUIStore } from '../../../store/useUIStore';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { TwoFactorSetup } from '../components/TwoFactorSetup';
import { getInitials, cn } from '../../../lib/utils';

export default function Settings() {
  const { user, setUser } = useAuth();
  const { theme, setTheme } = useUIStore();
  const fileInputRef = useRef(null);
  
  const [name, setName] = useState(user?.name || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);

  const [passData, setPassData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [isUpdatingPass, setIsUpdatingPass] = useState(false);

  // Profile Update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      const res = await api.patch('/users/me', { name });
      setUser({ ...user, name: res.data.name });
      toast.success('Profile updated');
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Avatar Upload
  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    setIsUploadingAvatar(true);
    try {
      const res = await api.post('/upload/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUser({ ...user, avatar: res.data });
      toast.success('Avatar updated');
    } catch (error) {
      toast.error(error.message || 'Failed to upload avatar');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Password Change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passData.newPassword !== passData.confirmPassword) return toast.error('Passwords do not match');
    setIsUpdatingPass(true);
    try {
      await api.post('/auth/change-password', passData);
      toast.success('Password changed successfully');
      setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.message || 'Failed to change password');
    } finally {
      setIsUpdatingPass(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your personal preferences and security.</p>
      </div>

      {/* Profile Section */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Profile Details</h2>
        </div>
        <form onSubmit={handleUpdateProfile} className="p-6 space-y-6">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-2xl overflow-hidden">
                {user?.avatar?.url ? (
                  <img src={user.avatar.url} alt="avatar" className="h-full w-full object-cover" />
                ) : getInitials(user?.name)}
              </div>
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                disabled={isUploadingAvatar}
              >
                <Camera className="h-6 w-6 text-white" />
              </button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
            </div>
            <div>
              <p className="font-medium text-slate-900 dark:text-white">Profile Photo</p>
              <p className="text-xs text-slate-500 mt-1">Click to upload. JPG, PNG, max 10MB.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
              <Input value={user?.email} disabled className="opacity-60 cursor-not-allowed" />
            </div>
          </div>
          <Button type="submit" isLoading={isUpdatingProfile}>Save Changes</Button>
        </form>
      </div>

      {/* Security Section (Password + 2FA) */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Security</h2>
        </div>
        
        {/* 2FA */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <p className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-500" /> Two-Factor Authentication
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {user?.twoFactorEnabled ? '2FA is enabled on your account.' : 'Add an extra layer of security to your account.'}
            </p>
          </div>
          <Button 
            variant={user?.twoFactorEnabled ? "outline" : "primary"} 
            onClick={() => setIs2FAModalOpen(true)}
          >
            {user?.twoFactorEnabled ? 'Manage 2FA' : 'Enable 2FA'}
          </Button>
        </div>

        {/* Password */}
        <form onSubmit={handleChangePassword} className="p-6 space-y-4">
          <h3 className="font-medium text-slate-900 dark:text-white flex items-center gap-2 mb-2"><KeyRound className="h-4 w-4" /> Change Password</h3>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Current Password</label>
            <Input type="password" value={passData.currentPassword} onChange={(e) => setPassData({...passData, currentPassword: e.target.value})} required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">New Password</label>
              <Input type="password" value={passData.newPassword} onChange={(e) => setPassData({...passData, newPassword: e.target.value})} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Confirm New Password</label>
              <Input type="password" value={passData.confirmPassword} onChange={(e) => setPassData({...passData, confirmPassword: e.target.value})} required />
            </div>
          </div>
          <Button type="submit" variant="danger" isLoading={isUpdatingPass}>Update Password</Button>
        </form>
      </div>

      {/* Appearance */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Appearance</h2>
        </div>
        <div className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-white">Theme Preference</p>
            <p className="text-xs text-slate-500 mt-1">Switch between light and dark mode.</p>
          </div>
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            <button onClick={() => setTheme('light')} className={cn("px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all", theme === 'light' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500")}>
              <Sun className="h-4 w-4" /> Light
            </button>
            <button onClick={() => setTheme('dark')} className={cn("px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all", theme === 'dark' ? "bg-slate-900 text-white shadow-sm" : "text-slate-500")}>
              <Moon className="h-4 w-4" /> Dark
            </button>
          </div>
        </div>
      </div>

      <TwoFactorSetup 
        isOpen={is2FAModalOpen} 
        onClose={() => setIs2FAModalOpen(false)} 
        onEnabled={() => setUser({ ...user, twoFactorEnabled: true })}
      />
    </div>
  );
}