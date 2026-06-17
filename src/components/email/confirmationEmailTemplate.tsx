import * as React from 'react';

interface EmailTemplateProps {
  to: string;
  name: string;
  bookingId: string;
  checkIn: string;
  checkOut: string;
  tent: string;
  amount: number;
}

export function EmailTemplate({
  to,
  name,
  bookingId,
  checkIn,
  checkOut,
  tent,
  amount,
}: EmailTemplateProps) {
  return (
    <div style={{ backgroundColor: '#f9fafb', padding: '32px 16px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ maxWidth: '672px', margin: '0 auto', backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(to right, #059669, #047857)', padding: '24px 32px' }}>
          <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#ffffff', marginBottom: '8px', margin: 0 }}>
            Booking Confirmed ✅
          </h1>
          <p style={{ color: '#d1fae5', fontSize: '14px', margin: 0 }}>
            Your wilderness adventure is confirmed!
          </p>
        </div>

        {/* Content */}
        <div style={{ padding: '24px 32px' }}>
          {/* Greeting */}
          <p style={{ color: '#1f2937', fontSize: '18px', marginBottom: '16px' }}>
            Hi <span style={{ fontWeight: '600', color: '#047857' }}>{name}</span>,
          </p>
          
          <p style={{ color: '#374151', marginBottom: '24px', lineHeight: '1.625' }}>
            Great news! Your booking at <strong>Wild Earth Jungle Camp</strong> has been successfully confirmed. 
            We're excited to host you for an unforgettable wilderness experience.
          </p>

          {/* Booking Details Card */}
          <div style={{ backgroundColor: '#ecfdf5', border: '2px solid #a7f3d0', borderRadius: '8px', padding: '24px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#064e3b', marginBottom: '16px', display: 'flex', alignItems: 'center', margin: '0 0 16px 0' }}>
              📋 Booking Details
            </h2>
            
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #a7f3d0' }}>
                <span style={{ color: '#4b5563', fontWeight: '500' }}>Booking ID:</span>
                <span style={{ color: '#064e3b', fontWeight: 'bold' }}>{bookingId}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #a7f3d0' }}>
                <span style={{ color: '#4b5563', fontWeight: '500' }}>Check-in:</span>
                <span style={{ color: '#111827', fontWeight: '600' }}>{checkIn}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #a7f3d0' }}>
                <span style={{ color: '#4b5563', fontWeight: '500' }}>Check-out:</span>
                <span style={{ color: '#111827', fontWeight: '600' }}>{checkOut}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #a7f3d0' }}>
                <span style={{ color: '#4b5563', fontWeight: '500' }}>Accommodation:</span>
                <span style={{ color: '#111827', fontWeight: '600' }}>{tent}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#d1fae5', borderRadius: '6px', marginTop: '8px' }}>
                <span style={{ color: '#064e3b', fontWeight: 'bold', fontSize: '18px' }}>Total Paid:</span>
                <span style={{ color: '#047857', fontWeight: 'bold', fontSize: '20px' }}>₹{amount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* What's Included */}
          <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e3a8a', marginBottom: '12px', margin: '0 0 12px 0' }}>✨ What's Included</h3>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
              <li style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '8px', color: '#374151' }}>
                <span style={{ color: '#2563eb', marginRight: '8px' }}>✓</span>
                <span>Breakfast & Evening Snacks</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '8px', color: '#374151' }}>
                <span style={{ color: '#2563eb', marginRight: '8px' }}>✓</span>
                <span>All Adventure Activities</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '8px', color: '#374151' }}>
                <span style={{ color: '#2563eb', marginRight: '8px' }}>✓</span>
                <span>Guided Nature Tours</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', color: '#374151' }}>
                <span style={{ color: '#2563eb', marginRight: '8px' }}>✓</span>
                <span>Bonfire & Music</span>
              </li>
            </ul>
          </div>

          {/* Important Information */}
          <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#78350f', marginBottom: '8px', margin: '0 0 8px 0' }}>📌 Important Information</h3>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
              <li style={{ marginBottom: '8px', color: '#374151', fontSize: '14px' }}>• Check-in time: 12:00 PM | Check-out time: 11:00 AM</li>
              <li style={{ marginBottom: '8px', color: '#374151', fontSize: '14px' }}>• Please carry a valid ID proof</li>
              <li style={{ marginBottom: '8px', color: '#374151', fontSize: '14px' }}>• Bring comfortable clothing and trekking shoes</li>
              <li style={{ color: '#374151', fontSize: '14px' }}>• For cancellations, please call us at least 48 hours in advance</li>
            </ul>
          </div>

          {/* Closing Message */}
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <p style={{ color: '#374151', fontSize: '18px', marginBottom: '8px' }}>
              We look forward to hosting you! 🌄
            </p>
            <p style={{ color: '#4b5563', fontWeight: '500', margin: 0 }}>
              – Wild Earth Jungle Camp Team
            </p>
          </div>
        </div>

        {/* Footer */}
        <div style={{ backgroundColor: '#f3f4f6', padding: '24px 32px', borderTop: '1px solid #e5e7eb' }}>
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <p style={{ color: '#374151', fontWeight: '500', marginBottom: '8px' }}>Need Help?</p>
            <p style={{ color: '#4b5563', fontSize: '14px', marginBottom: '12px' }}>
              Our team is here to assist you 24/7
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <a 
                href="tel:+919876543210" 
                style={{ display: 'inline-flex', alignItems: 'center', padding: '8px 16px', backgroundColor: '#059669', color: '#ffffff', borderRadius: '6px', fontWeight: '500', fontSize: '14px', textDecoration: 'none' }}
              >
                📞 +91 9876543210
              </a>
              <a 
                href="mailto:support@wildearth.com" 
                style={{ display: 'inline-flex', alignItems: 'center', padding: '8px 16px', backgroundColor: '#2563eb', color: '#ffffff', borderRadius: '6px', fontWeight: '500', fontSize: '14px', textDecoration: 'none' }}
              >
                ✉️ Email Us
              </a>
            </div>
          </div>
          
          <div style={{ textAlign: 'center', color: '#6b7280', fontSize: '12px', paddingTop: '16px', borderTop: '1px solid #d1d5db' }}>
            <p style={{ margin: 0 }}>© 2026 Wild Earth Jungle Camp. All rights reserved.</p>
            <p style={{ marginTop: '4px', margin: '4px 0 0 0' }}>This is an automated confirmation email. Please do not reply.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Made with Bob
