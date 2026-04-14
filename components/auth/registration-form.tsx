'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Loader } from 'lucide-react';

interface RegistrationFormProps {
  onRegistrationComplete?: () => void;
  onSwitchToLogin?: () => void;
}

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  companyName: string;
  facilityType: string;
  country: string;
  phone: string;
  message: string;
}

interface FormError {
  field: string;
  message: string;
}

const FACILITY_TYPES = [
  'Manufacturing',
  'Agriculture',
  'Energy Production',
  'Chemical Processing',
  'Steel Mill',
  'Cement Plant',
  'Refinery',
  'Textiles',
  'Food & Beverage',
  'Waste Management',
  'Other',
];

export function RegistrationForm({ onRegistrationComplete, onSwitchToLogin }: RegistrationFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    facilityType: '',
    country: '',
    phone: '',
    message: '',
  });

  const [errors, setErrors] = useState<FormError[]>([]);
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormError[] = [];

    if (!formData.email) {
      newErrors.push({ field: 'email', message: 'Email is required' });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.push({ field: 'email', message: 'Invalid email format' });
    }

    if (!formData.password) {
      newErrors.push({ field: 'password', message: 'Password is required' });
    } else if (formData.password.length < 8) {
      newErrors.push({ field: 'password', message: 'Password must be at least 8 characters' });
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.push({ field: 'confirmPassword', message: 'Passwords do not match' });
    }

    if (!formData.companyName) {
      newErrors.push({ field: 'companyName', message: 'Company name is required' });
    }

    if (!formData.facilityType) {
      newErrors.push({ field: 'facilityType', message: 'Facility type is required' });
    }

    if (!formData.country) {
      newErrors.push({ field: 'country', message: 'Country is required' });
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    setErrors((prev) => prev.filter((err) => err.field !== name));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Navigate to pending approval page
      router.push(`/pending-approval?email=${encodeURIComponent(formData.email)}`);
    } catch (error) {
      setErrors([
        {
          field: 'submit',
          message: error instanceof Error ? error.message : 'Registration failed. Please try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const submitError = errors.find((e) => e.field === 'submit');
  const fieldError = (fieldName: string) => errors.find((e) => e.field === fieldName)?.message;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#0a0e1a] via-[#0f1929] to-[#0a0e1a]">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#00FF88] to-[#00CCFF] bg-clip-text text-transparent mb-2">
            Register
          </h1>
          <p className="text-white/60">Create your AuraCarbon account</p>
        </div>

        {submitError && (
          <div className="mb-6 p-4 bg-[#FF3366]/20 border border-[#FF3366]/50 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-[#FF3366] flex-shrink-0 mt-0.5" />
            <div className="text-sm text-[#FF3366]">{submitError.message}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@company.com"
              className={`w-full px-4 py-2 bg-white/5 border rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 transition-colors ${
                fieldError('email')
                  ? 'border-[#FF3366]/50 focus:ring-[#FF3366]/50'
                  : 'border-white/10 focus:ring-[#00CCFF]/50'
              }`}
            />
            {fieldError('email') && <p className="text-xs text-[#FF3366] mt-1">{fieldError('email')}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className={`w-full px-4 py-2 bg-white/5 border rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 transition-colors ${
                fieldError('password')
                  ? 'border-[#FF3366]/50 focus:ring-[#FF3366]/50'
                  : 'border-white/10 focus:ring-[#00CCFF]/50'
              }`}
            />
            {fieldError('password') && <p className="text-xs text-[#FF3366] mt-1">{fieldError('password')}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              className={`w-full px-4 py-2 bg-white/5 border rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 transition-colors ${
                fieldError('confirmPassword')
                  ? 'border-[#FF3366]/50 focus:ring-[#FF3366]/50'
                  : 'border-white/10 focus:ring-[#00CCFF]/50'
              }`}
            />
            {fieldError('confirmPassword') && (
              <p className="text-xs text-[#FF3366] mt-1">{fieldError('confirmPassword')}</p>
            )}
          </div>

          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Company Name</label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="Your Company Ltd."
              className={`w-full px-4 py-2 bg-white/5 border rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 transition-colors ${
                fieldError('companyName')
                  ? 'border-[#FF3366]/50 focus:ring-[#FF3366]/50'
                  : 'border-white/10 focus:ring-[#00CCFF]/50'
              }`}
            />
            {fieldError('companyName') && <p className="text-xs text-[#FF3366] mt-1">{fieldError('companyName')}</p>}
          </div>

          {/* Facility Type */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Facility Type</label>
            <select
              name="facilityType"
              value={formData.facilityType}
              onChange={handleChange}
              className={`w-full px-4 py-2 bg-white/5 border rounded-lg text-black focus:outline-none focus:ring-2 transition-colors ${
                fieldError('facilityType')
                  ? 'border-[#FF3366]/50 focus:ring-[#FF3366]/50'
                  : 'border-white/10 focus:ring-[#00CCFF]/50'
              }`}
            >
              <option value="">Select a facility type</option>
              {FACILITY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {fieldError('facilityType') && <p className="text-xs text-[#FF3366] mt-1">{fieldError('facilityType')}</p>}
          </div>

          {/* Country */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Country</label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              placeholder="Pakistan"
              className={`w-full px-4 py-2 bg-white/5 border rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 transition-colors ${
                fieldError('country')
                  ? 'border-[#FF3366]/50 focus:ring-[#FF3366]/50'
                  : 'border-white/10 focus:ring-[#00CCFF]/50'
              }`}
            />
            {fieldError('country') && <p className="text-xs text-[#FF3366] mt-1">{fieldError('country')}</p>}
          </div>

          {/* Phone (Optional) */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Phone (Optional)</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+92-123-4567890"
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#00CCFF]/50 transition-colors"
            />
          </div>

          {/* Message (Optional) */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Additional Message (Optional)</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Tell us about your facility or any specific requirements..."
              rows={3}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#00CCFF]/50 transition-colors resize-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-gradient-to-r from-[#00FF88] to-[#00CCFF] text-black font-medium rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2"
          >
            {loading && <Loader className="w-4 h-4 animate-spin" />}
            {loading ? 'Creating Account...' : 'Register'}
          </button>

          {/* Switch to Login */}
          <p className="text-center text-white/60 text-sm">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-[#00CCFF] hover:text-[#00CCFF]/80 transition-colors"
            >
              Login
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
