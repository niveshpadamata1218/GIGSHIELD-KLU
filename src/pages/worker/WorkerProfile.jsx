import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '../../store/authStore'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

function WorkerProfile() {
  const { user, updateUserProfile } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const fileInputRef = useRef(null)

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    city: user?.city || '',
    state: user?.state || '',
    profilePicture: user?.profilePicture || null
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleProfilePictureUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      setFormData(prev => ({
        ...prev,
        profilePicture: event.target?.result
      }))
    }
    reader.readAsDataURL(file)
  }

  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
      await updateUserProfile(formData)
      setSuccessMessage('Profile updated successfully!')
      setIsEditing(false)
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  const gigScore = user?.gigScore || 0
  const hoursWorked = user?.hoursWorked || 0
  const distanceCovered = user?.distanceCovered || 0
  const activeDaysThisMonth = user?.activeDaysThisMonth || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-gs-text">Worker Profile</h1>
          <p className="mt-1 text-sm text-gs-muted">View and manage your profile information</p>
        </div>
        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            variant="secondary"
          >
            Edit Profile
          </Button>
        )}
      </div>

      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
        >
          ✓ {successMessage}
        </motion.div>
      )}

      {/* Profile Picture & Basic Info */}
      <Card>
        <div className="space-y-6">
          <div className="flex items-start gap-6">
            {/* Profile Picture */}
            <div className="flex flex-col items-center gap-3">
              <div className="h-32 w-32 rounded-full border-4 border-gs-border bg-gs-surface-2 flex items-center justify-center overflow-hidden">
                {formData.profilePicture ? (
                  <img
                    src={formData.profilePicture}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gs-electric to-gs-violet text-4xl font-bold text-white">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-semibold text-gs-electric hover:text-gs-violet"
                >
                  Change Photo
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfilePictureUpload}
                className="hidden"
              />
            </div>

            {/* Basic Info */}
            {isEditing ? (
              <div className="flex-1 space-y-4">
                <Input
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your full name"
                />
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                />
                <Input
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled
                  placeholder="10-digit phone"
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="City"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="City"
                  />
                  <Input
                    label="State"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="State"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="flex-1"
                  >
                    {isSaving ? <LoadingSpinner /> : 'Save Changes'}
                  </Button>
                  <Button
                    onClick={() => {
                      setIsEditing(false)
                      setFormData({
                        name: user?.name || '',
                        email: user?.email || '',
                        phone: user?.phone || '',
                        city: user?.city || '',
                        state: user?.state || '',
                        profilePicture: user?.profilePicture || null
                      })
                    }}
                    variant="secondary"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex-1 space-y-3">
                <div>
                  <div className="text-xs uppercase tracking-wide text-gs-muted">Full Name</div>
                  <div className="mt-1 text-lg font-semibold text-gs-text">{user?.name || '—'}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-gs-muted">Email</div>
                  <div className="mt-1 text-lg font-semibold text-gs-text">{user?.email || '—'}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-gs-muted">Phone</div>
                  <div className="mt-1 text-lg font-semibold text-gs-text">{user?.phone || '—'}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-gs-muted">City</div>
                    <div className="mt-1 text-lg font-semibold text-gs-text">{user?.city || '—'}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-gs-muted">State</div>
                    <div className="mt-1 text-lg font-semibold text-gs-text">{user?.state || '—'}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Gig Score Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wide text-gs-muted">Gig Score</div>
              <div className="mt-2 text-3xl font-extrabold text-gs-text">{gigScore}</div>
              <div className="mt-1 text-xs text-gs-muted">out of 100</div>
            </div>
            <div className="text-5xl font-bold text-gs-electric opacity-20">⭐</div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wide text-gs-muted">Hours Worked</div>
              <div className="mt-2 text-3xl font-extrabold text-gs-text">{hoursWorked}</div>
              <div className="mt-1 text-xs text-gs-muted">this month</div>
            </div>
            <div className="text-5xl font-bold text-gs-violet opacity-20">⏱️</div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wide text-gs-muted">Distance Covered</div>
              <div className="mt-2 text-3xl font-extrabold text-gs-text">{distanceCovered.toFixed(1)}</div>
              <div className="mt-1 text-xs text-gs-muted">km this month</div>
            </div>
            <div className="text-5xl font-bold text-gs-gold opacity-20">📍</div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wide text-gs-muted">Active Days</div>
              <div className="mt-2 text-3xl font-extrabold text-gs-text">{activeDaysThisMonth}</div>
              <div className="mt-1 text-xs text-gs-muted">days this month</div>
            </div>
            <div className="text-5xl font-bold text-gs-electric opacity-20">📅</div>
          </div>
        </Card>
      </div>

      {/* Account Status */}
      <Card>
        <div className="space-y-4">
          <h3 className="font-semibold text-gs-text">Account Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-gs-surface-2 px-4 py-3">
              <span className="text-sm text-gs-text">Plan Status</span>
              <Badge status={user?.planActivated ? 'paid' : 'pending'}>
                {user?.planActivated ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-gs-surface-2 px-4 py-3">
              <span className="text-sm text-gs-text">Member Since</span>
              <span className="text-sm font-semibold text-gs-text">
                {user?.memberSince ? new Date(user.memberSince).toLocaleDateString() : '—'}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-gs-surface-2 px-4 py-3">
              <span className="text-sm text-gs-text">Fraud Risk Score</span>
              <Badge status={user?.fraudRiskScore > 30 ? 'fraud' : 'paid'}>
                {user?.fraudRiskScore || 0}%
              </Badge>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default WorkerProfile
