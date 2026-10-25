'use client';

import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Calendar } from '../../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

export default function Booking() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    numberOfGuest: '',
    specialRequest:''
  });
  let message:any

  const handleSubmit = (e: React.FormEvent)=>{
      e.preventDefault();
     
      message = `Name: ${formData.name}.
                 Contact: ${formData?.phone}.
                ${formData.email.length ? 'Email:'+formData.email:''}
                 Checkin-date: ${date?.toString().slice(0,10)}.
                 Number of Guest: ${formData.numberOfGuest}.
        ${formData?.specialRequest.length ? 'Special Request: '+ formData.specialRequest:''}
      `;
      const encodedMessage = encodeURIComponent(message);
  
      const whatsappUrl = `https://wa.me/+917204520500?text=${encodedMessage}`;
        setFormData({
          name: '',
          email: '',
          phone: '',
          numberOfGuest: '',
          specialRequest: ''
        })
        setDate
      window.open(whatsappUrl, '_blank');

  }
  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Book Your Stay</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Experience luxury in the wilderness with our premium accommodations
          </p>
        </div>
      </section>

      {/* Booking Form Section */}
      <section className="py-20">
        <div className="container max-w-4xl">
          <Card className="p-8">
            <form className="space-y-8" onSubmit={handleSubmit}>
              
                <div className="space-y-4">
                  <Label htmlFor="firstName">Name</Label>
                  <Input id="firstName" value={formData.name} required={true}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Enter your first name" />
                </div>
             

              <div className="space-y-4">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={formData.email} 
                  onChange={(e)=>setFormData({...formData, email: e.target.value})}
                  type="email" placeholder="Enter your email" />
              </div>

              <div className="space-y-4">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" type="tel"
                required={true}
                value={formData.phone}
                onChange={(e)=>setFormData({...formData, phone: e.target.value})}
                 placeholder="Enter your phone number" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Label>Check-in Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                       
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, 'PPP') : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className='bg-white'
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-4">
                  <Label htmlFor="guests">Number of Guests</Label>
                  <Input id="guests" type="number" value={formData.numberOfGuest}
                  onChange={(e)=>{setFormData({...formData,numberOfGuest:e.target.value})}}
                  required={true}
                  min="1" placeholder="Enter number of guests" />
                </div>
              </div>

              <div className="space-y-4">
                <Label htmlFor="specialRequests">Special Requests</Label>
                <textarea
                  id="specialRequests"
                  value={formData.specialRequest}
                  onChange={(e)=>{setFormData({...formData,specialRequest:e.target.value})}}
                  className="w-full min-h-[100px] p-3 rounded-md border border-input"
                  placeholder="Any special requests or preferences?"
                />
              </div>

              <Button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white">
                Book Now
              </Button>
            </form>
          </Card>
        </div>
      </section>

      {/* Booking Information */}
      <section className="py-20 bg-muted">
        <div className="container max-w-4xl">
          <h2 className="text-3xl font-bold mb-8 text-center">Booking Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Policies</h3>
              <ul className="space-y-2 text-text/80">
                <li>Check-in: 2:00 PM</li>
                <li>Check-out: 11:00 AM</li>
                <li>Minimum stay: 2 nights</li>
                <li>Pet policy: Not allowed</li>
              </ul>
            </Card>
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Cancellation Policy</h3>
              <p className="text-text/80">
                Free cancellation up to 7 days before check-in. Cancellations made within 7 days of
                check-in are subject to a fee of one night's stay.
              </p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
