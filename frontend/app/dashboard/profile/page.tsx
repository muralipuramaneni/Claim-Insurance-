'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Breadcrumb, generateBreadcrumbs } from '@/components/ui/Breadcrumb'
import { useAuth } from '@/lib/AuthContext'

export default function ProfilePage() {
  const { user, profile } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    emergencyContact: '',
    emergencyPhone: ''
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    if (user && profile) {
      setFormData({
        fullName: profile.full_name || '',
        email: user.email || '',
        phone: profile.phone || '',
        address: profile.address || '',
        city: profile.city || '',
        state: profile.state || '',
        zipCode: profile.zip_code || '',
        emergencyContact: profile.emergency_contact || '',
        emergencyPhone: profile.emergency_phone || ''
      })
    }
  }, [user, profile])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}
    
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      alert('Profile updated successfully!')
      setEditing(false)
    } catch (error) {
      alert('Failed to update profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setEditing(false)
    setErrors({})
    // Reset form data to original values
    if (user && profile) {
      setFormData({
        fullName: profile.full_name || '',
        email: user.email || '',
        phone: profile.phone || '',
        address: profile.address || '',
        city: profile.city || '',
        state: profile.state || '',
        zipCode: profile.zip_code || '',
        emergencyContact: profile.emergency_contact || '',
        emergencyPhone: profile.emergency_phone || ''
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Breadcrumb items={generateBreadcrumbs(pathname)} className="animate-fade-in-up" />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Personal Information</h2>
              <p className="text-sm text-gray-600">Manage your account details and contact information</p>
            </div>
            {!editing && (
              <Button onClick={() => setEditing(true)}>
                Edit Profile
              </Button>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Details */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              </div>
              
              <Input
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                disabled={!editing}
                required
                error={errors.fullName}
              />

              <Input
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled={true} // Email should not be editable
                required
                helperText="Contact support to change your email address"
              />

              <Input
                label="Phone Number"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                disabled={!editing}
                placeholder="(555) 123-4567"
                error={errors.phone}
              />

              {/* Address Information */}
              <div className="md:col-span-2 mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Address Information</h3>
              </div>

              <div className="md:col-span-2">
                <Input
                  label="Street Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={!editing}
                  placeholder="123 Main Street"
                />
              </div>

              <Input
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
                disabled={!editing}
                placeholder="San Francisco"
              />

              <Input
                label="State"
                name="state"
                value={formData.state}
                onChange={handleChange}
                disabled={!editing}
                placeholder="CA"
              />

              <Input
                label="ZIP Code"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                disabled={!editing}
                placeholder="94102"
              />

              {/* Emergency Contact */}
              <div className="md:col-span-2 mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Emergency Contact</h3>
              </div>

              <Input
                label="Emergency Contact Name"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleChange}
                disabled={!editing}
                placeholder="John Doe"
              />

              <Input
                label="Emergency Contact Phone"
                name="emergencyPhone"
                type="tel"
                value={formData.emergencyPhone}
                onChange={handleChange}
                disabled={!editing}
                placeholder="(555) 987-6543"
              />
            </div>

            {editing && (
              <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={loading}
                  disabled={loading}
                >
                  Save Changes
                </Button>
              </div>
            )}
          </form>
        </div>

        {/* Account Settings */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Account Settings</h2>
            <p className="text-sm text-gray-600">Manage your account preferences and security</p>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Account Status</h3>
                <p className="text-sm text-gray-600">Your account is active and verified</p>
              </div>
              <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                Active
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h3>
                <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
              </div>
              <Button variant="outline" size="sm">
                Enable 2FA
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Password</h3>
                <p className="text-sm text-gray-600">Last changed 30 days ago</p>
              </div>
              <Button variant="outline" size="sm">
                Change Password
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Download Data</h3>
                <p className="text-sm text-gray-600">Download a copy of your account data</p>
              </div>
              <Button variant="outline" size="sm">
                Request Export
              </Button>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 border-l-4 border-l-red-400">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-red-900">Danger Zone</h2>
            <p className="text-sm text-red-600">Irreversible and destructive actions</p>
          </div>
          
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Delete Account</h3>
                <p className="text-sm text-gray-600">
                  Permanently delete your account and all associated data
                </p>
              </div>
              <Button variant="destructive" size="sm">
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}