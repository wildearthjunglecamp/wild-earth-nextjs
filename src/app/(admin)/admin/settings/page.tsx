'use client';

import { useState } from 'react';
import { 
  Building2, 
  Clock, 
  DollarSign, 
  Bell, 
  CreditCard, 
  User,
  Save,
  Eye,
  EyeOff,
  LogOut
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Switch } from '@/src/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Separator } from '@/src/components/ui/separator';
import { Textarea } from '@/src/components/ui/textarea';

// Types
interface BusinessInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
}

interface BookingSettings {
  checkInTime: string;
  checkOutTime: string;
  allowSameDayBooking: boolean;
  maxGuestsPerBooking: number;
}

interface TentPricing {
  id: string;
  name: string;
  price: number;
  capacity: number;
}

interface AddOn {
  id: string;
  name: string;
  price: number;
  enabled: boolean;
}

interface NotificationSettings {
  customer: {
    bookingConfirmation: boolean;
    paymentConfirmation: boolean;
    reminderBeforeVisit: boolean;
  };
  admin: {
    newBookingAlert: boolean;
  };
}

interface PaymentSettings {
  razorpayKeyId: string;
  razorpayKeySecret: string;
}

export default function SettingsPage() {
  // State management
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({
    name: 'Wild Earth Campsite',
    phone: '+91 98765 43210',
    email: 'info@wildearth.com',
    address: 'Forest Ridge, Wilderness Valley, Maharashtra 412345',
  });

  const [bookingSettings, setBookingSettings] = useState<BookingSettings>({
    checkInTime: '13:00',
    checkOutTime: '11:00',
    allowSameDayBooking: true,
    maxGuestsPerBooking: 20,
  });

  const [tentPricing, setTentPricing] = useState<TentPricing[]>([
    { id: '1', name: 'Twin Sharing Small Tent', price: 1500, capacity: 2 },
    { id: '2', name: 'Twin Sharing Semi Big Tent', price: 1800, capacity: 2 },
    { id: '3', name: 'Three Sharing Jungle Tent', price: 2400, capacity: 3 },
    { id: '4', name: 'Four Sharing Jungle Tent', price: 3200, capacity: 4 },
    { id: '5', name: 'BYOT (Bring Your Own Tent)', price: 500, capacity: 0 },
  ]);

  const [addOns, setAddOns] = useState<AddOn[]>([
    { id: '1', name: 'Lunch', price: 300, enabled: true },
    { id: '2', name: 'Dinner', price: 400, enabled: true },
  ]);

  const [notifications, setNotifications] = useState<NotificationSettings>({
    customer: {
      bookingConfirmation: true,
      paymentConfirmation: true,
      reminderBeforeVisit: true,
    },
    admin: {
      newBookingAlert: true,
    },
  });

  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    razorpayKeyId: 'rzp_test_1234567890',
    razorpayKeySecret: '••••••••••••••••',
  });

  const [showSecret, setShowSecret] = useState(false);
  const [adminInfo] = useState({
    name: 'Admin User',
    email: 'admin@wildearth.com',
  });

  // Handlers
  const handleBusinessInfoSave = () => {
    console.log('Saving business info:', businessInfo);
    // TODO: API call to save business info
  };

  const handleBookingSettingsSave = () => {
    console.log('Saving booking settings:', bookingSettings);
    // TODO: API call to save booking settings
  };

  const handleTentPricingUpdate = (id: string, field: 'price' | 'capacity', value: number) => {
    setTentPricing(tentPricing.map(tent =>
      tent.id === id ? { ...tent, [field]: value } : tent
    ));
  };

  const handleTentPricingSave = () => {
    console.log('Saving tent pricing:', tentPricing);
    // TODO: API call to save tent pricing
  };

  const handleAddOnUpdate = (id: string, field: 'price' | 'enabled', value: number | boolean) => {
    setAddOns(addOns.map(addOn =>
      addOn.id === id ? { ...addOn, [field]: value } : addOn
    ));
  };

  const handleAddOnsSave = () => {
    console.log('Saving add-ons:', addOns);
    // TODO: API call to save add-ons
  };

  const handleNotificationsSave = () => {
    console.log('Saving notifications:', notifications);
    // TODO: API call to save notifications
  };

  const handlePaymentSettingsSave = () => {
    console.log('Saving payment settings:', paymentSettings);
    // TODO: API call to save payment settings
  };

  const handleChangePassword = () => {
    console.log('Change password clicked');
    // TODO: Open change password dialog
  };

  const handleLogout = () => {
    console.log('Logout clicked');
    // TODO: Implement logout
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="font-display text-display-lg text-primary-900 mb-2">
          Settings
        </h1>
        <p className="font-body text-body-md text-secondary-600">
          Manage your resort's core information and operational preferences
        </p>
      </div>

      {/* Business Information */}
      <Card className="border-surface-200 shadow-level-1">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary-600" />
            <CardTitle className="font-display text-headline-md text-primary-900">
              Business Information
            </CardTitle>
          </div>
          <CardDescription className="font-body text-body-sm text-secondary-600">
            Basic information about your campsite
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="campsite-name" className="font-body text-label-sm text-secondary-700">
                Campsite Name
              </Label>
              <Input
                id="campsite-name"
                value={businessInfo.name}
                onChange={(e) => setBusinessInfo({ ...businessInfo, name: e.target.value })}
                className="font-body text-body-md"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-phone" className="font-body text-label-sm text-secondary-700">
                Contact Phone
              </Label>
              <Input
                id="contact-phone"
                value={businessInfo.phone}
                onChange={(e) => setBusinessInfo({ ...businessInfo, phone: e.target.value })}
                className="font-body text-body-md"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="font-body text-label-sm text-secondary-700">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={businessInfo.email}
              onChange={(e) => setBusinessInfo({ ...businessInfo, email: e.target.value })}
              className="font-body text-body-md"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="font-body text-label-sm text-secondary-700">
              Address
            </Label>
            <Textarea
              id="address"
              value={businessInfo.address}
              onChange={(e) => setBusinessInfo({ ...businessInfo, address: e.target.value })}
              className="font-body text-body-md"
              rows={3}
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={handleBusinessInfoSave} className="bg-primary-600 hover:bg-primary-700">
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Booking Settings */}
      <Card className="border-surface-200 shadow-level-1">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary-600" />
            <CardTitle className="font-display text-headline-md text-primary-900">
              Booking Settings
            </CardTitle>
          </div>
          <CardDescription className="font-body text-body-sm text-secondary-600">
            Configure check-in/check-out times and booking rules
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="check-in-time" className="font-body text-label-sm text-secondary-700">
                Check-in Time
              </Label>
              <Input
                id="check-in-time"
                type="time"
                value={bookingSettings.checkInTime}
                onChange={(e) => setBookingSettings({ ...bookingSettings, checkInTime: e.target.value })}
                className="font-body text-body-md"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="check-out-time" className="font-body text-label-sm text-secondary-700">
                Check-out Time
              </Label>
              <Input
                id="check-out-time"
                type="time"
                value={bookingSettings.checkOutTime}
                onChange={(e) => setBookingSettings({ ...bookingSettings, checkOutTime: e.target.value })}
                className="font-body text-body-md"
              />
            </div>
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="space-y-0.5">
              <Label className="font-body text-body-md text-primary-900">
                Allow Same Day Booking
              </Label>
              <p className="font-body text-body-sm text-secondary-600">
                Enable guests to book for today
              </p>
            </div>
            <Switch
              checked={bookingSettings.allowSameDayBooking}
              onCheckedChange={(checked) => setBookingSettings({ ...bookingSettings, allowSameDayBooking: checked })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="max-guests" className="font-body text-label-sm text-secondary-700">
              Max Guests per Booking (Optional)
            </Label>
            <Input
              id="max-guests"
              type="number"
              value={bookingSettings.maxGuestsPerBooking}
              onChange={(e) => setBookingSettings({ ...bookingSettings, maxGuestsPerBooking: parseInt(e.target.value) || 0 })}
              className="font-body text-body-md"
              placeholder="Leave 0 for unlimited"
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={handleBookingSettingsSave} className="bg-primary-600 hover:bg-primary-700">
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Management */}
      <Card className="border-surface-200 shadow-level-1">
        <CardHeader>
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary-600" />
            <CardTitle className="font-display text-headline-md text-primary-900">
              Tent Pricing
            </CardTitle>
          </div>
          <CardDescription className="font-body text-body-sm text-secondary-600">
            Manage pricing for different tent types
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {tentPricing.map((tent) => (
            <div key={tent.id} className="flex items-center gap-4 p-4 bg-surface-50 rounded-lg">
              <div className="flex-1">
                <p className="font-body text-body-md text-primary-900 font-medium">
                  {tent.name}
                </p>
                {tent.capacity > 0 && (
                  <p className="font-body text-body-sm text-secondary-600">
                    Capacity: {tent.capacity} guests
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Label className="font-body text-label-sm text-secondary-700">₹</Label>
                <Input
                  type="number"
                  value={tent.price}
                  onChange={(e) => handleTentPricingUpdate(tent.id, 'price', parseInt(e.target.value) || 0)}
                  className="w-32 font-body text-body-md"
                />
              </div>
            </div>
          ))}

          <div className="flex justify-end">
            <Button onClick={handleTentPricingSave} className="bg-primary-600 hover:bg-primary-700">
              <Save className="mr-2 h-4 w-4" />
              Save Pricing
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Add-ons Management */}
      <Card className="border-surface-200 shadow-level-1">
        <CardHeader>
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary-600" />
            <CardTitle className="font-display text-headline-md text-primary-900">
              Add-ons Management
            </CardTitle>
          </div>
          <CardDescription className="font-body text-body-sm text-secondary-600">
            Manage meal add-ons and pricing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {addOns.map((addOn) => (
            <div key={addOn.id} className="flex items-center gap-4 p-4 bg-surface-50 rounded-lg">
              <div className="flex-1">
                <p className="font-body text-body-md text-primary-900 font-medium">
                  {addOn.name}
                </p>
                <p className="font-body text-body-sm text-secondary-600">
                  Per person
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label className="font-body text-label-sm text-secondary-700">₹</Label>
                  <Input
                    type="number"
                    value={addOn.price}
                    onChange={(e) => handleAddOnUpdate(addOn.id, 'price', parseInt(e.target.value) || 0)}
                    className="w-32 font-body text-body-md"
                    disabled={!addOn.enabled}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label className="font-body text-label-sm text-secondary-700">Enabled</Label>
                  <Switch
                    checked={addOn.enabled}
                    onCheckedChange={(checked) => handleAddOnUpdate(addOn.id, 'enabled', checked)}
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-end">
            <Button onClick={handleAddOnsSave} className="bg-primary-600 hover:bg-primary-700">
              <Save className="mr-2 h-4 w-4" />
              Save Add-ons
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="border-surface-200 shadow-level-1">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary-600" />
            <CardTitle className="font-display text-headline-md text-primary-900">
              Notification Settings
            </CardTitle>
          </div>
          <CardDescription className="font-body text-body-sm text-secondary-600">
            Configure email notifications for customers and admin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-body text-body-md text-primary-900 font-semibold">
              Customer Notifications
            </h3>
            
            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label className="font-body text-body-md text-primary-900">
                  Booking Confirmation Email
                </Label>
                <p className="font-body text-body-sm text-secondary-600">
                  Send email when booking is confirmed
                </p>
              </div>
              <Switch
                checked={notifications.customer.bookingConfirmation}
                onCheckedChange={(checked) => setNotifications({
                  ...notifications,
                  customer: { ...notifications.customer, bookingConfirmation: checked }
                })}
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label className="font-body text-body-md text-primary-900">
                  Payment Confirmation Email
                </Label>
                <p className="font-body text-body-sm text-secondary-600">
                  Send email when payment is successful
                </p>
              </div>
              <Switch
                checked={notifications.customer.paymentConfirmation}
                onCheckedChange={(checked) => setNotifications({
                  ...notifications,
                  customer: { ...notifications.customer, paymentConfirmation: checked }
                })}
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label className="font-body text-body-md text-primary-900">
                  Reminder Before Visit
                </Label>
                <p className="font-body text-body-sm text-secondary-600">
                  Send reminder 1 day before check-in
                </p>
              </div>
              <Switch
                checked={notifications.customer.reminderBeforeVisit}
                onCheckedChange={(checked) => setNotifications({
                  ...notifications,
                  customer: { ...notifications.customer, reminderBeforeVisit: checked }
                })}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-body text-body-md text-primary-900 font-semibold">
              Admin Notifications
            </h3>
            
            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label className="font-body text-body-md text-primary-900">
                  New Booking Alert
                </Label>
                <p className="font-body text-body-sm text-secondary-600">
                  Receive email when new booking is made
                </p>
              </div>
              <Switch
                checked={notifications.admin.newBookingAlert}
                onCheckedChange={(checked) => setNotifications({
                  ...notifications,
                  admin: { ...notifications.admin, newBookingAlert: checked }
                })}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleNotificationsSave} className="bg-primary-600 hover:bg-primary-700">
              <Save className="mr-2 h-4 w-4" />
              Save Notifications
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment Settings */}
      <Card className="border-surface-200 shadow-level-1">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary-600" />
            <CardTitle className="font-display text-headline-md text-primary-900">
              Payment Settings
            </CardTitle>
          </div>
          <CardDescription className="font-body text-body-sm text-secondary-600">
            Configure Razorpay payment gateway credentials
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="razorpay-key-id" className="font-body text-label-sm text-secondary-700">
              Razorpay Key ID
            </Label>
            <Input
              id="razorpay-key-id"
              value={paymentSettings.razorpayKeyId}
              onChange={(e) => setPaymentSettings({ ...paymentSettings, razorpayKeyId: e.target.value })}
              className="font-body text-body-md font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="razorpay-key-secret" className="font-body text-label-sm text-secondary-700">
              Razorpay Key Secret
            </Label>
            <div className="relative">
              <Input
                id="razorpay-key-secret"
                type={showSecret ? 'text' : 'password'}
                value={paymentSettings.razorpayKeySecret}
                onChange={(e) => setPaymentSettings({ ...paymentSettings, razorpayKeySecret: e.target.value })}
                className="font-body text-body-md font-mono pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowSecret(!showSecret)}
              >
                {showSecret ? (
                  <EyeOff className="h-4 w-4 text-secondary-500" />
                ) : (
                  <Eye className="h-4 w-4 text-secondary-500" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handlePaymentSettingsSave} className="bg-primary-600 hover:bg-primary-700">
              <Save className="mr-2 h-4 w-4" />
              Save Payment Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Admin Account */}
      <Card className="border-surface-200 shadow-level-1">
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary-600" />
            <CardTitle className="font-display text-headline-md text-primary-900">
              Admin Account
            </CardTitle>
          </div>
          <CardDescription className="font-body text-body-sm text-secondary-600">
            Manage your admin account settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-body text-label-sm text-secondary-700">
                Admin Name
              </Label>
              <Input
                value={adminInfo.name}
                disabled
                className="font-body text-body-md bg-surface-100"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-body text-label-sm text-secondary-700">
                Email
              </Label>
              <Input
                value={adminInfo.email}
                disabled
                className="font-body text-body-md bg-surface-100"
              />
            </div>
          </div>

          <Separator />

          <div className="flex gap-3">
            <Button onClick={handleChangePassword} variant="outline" className="border-primary-600 text-primary-600 hover:bg-primary-50">
              Change Password
            </Button>
            <Button onClick={handleLogout} variant="outline" className="border-red-600 text-red-600 hover:bg-red-50">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Made with Bob