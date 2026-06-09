'use client'
import { Metadata } from 'next';
import { useState } from 'react';

// export const metadata: Metadata = {
//   title: 'Check Availability | Wild Earth Jungle Camp',
//   description: 'Check availability for your preferred dates',
// };

export default function AvailabilityPage() {
  const [checkInDate, setCheckIn] = useState("");
  const [checkOutDate, setCheckOut] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleCheckAvailability = async () => {
    if (!checkInDate || !checkOutDate) {
      alert("Please select dates");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/availability", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          checkInDate,
          checkOutDate,
        }),
      });

      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error(error);
      alert("Error fetching availability");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20">
      <section className="py-20 bg-primary text-white">
        <div className="container text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Check Availability</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Find the perfect dates for your wilderness adventure
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container max-w-4xl">
          <h1 className="text-xl font-bold">Test Availability API</h1>

      <div className="space-y-2">
        <label>Check In</label>
        <input
          type="date"
          value={checkInDate}
          onChange={(e) => setCheckIn(e.target.value)}
          className="border p-2 w-full"
        />
      </div>

      <div className="space-y-2">
        <label>Check Out</label>
        <input
          type="date"
          value={checkOutDate}
          onChange={(e) => setCheckOut(e.target.value)}
          className="border p-2 w-full"
        />
      </div>

      <button
        onClick={handleCheckAvailability}
        className="bg-green-600 text-white px-4 py-2 rounded"
        disabled={loading}
      >
        {loading ? "Checking..." : "Check Availability"}
      </button>

      <div className="mt-4">
        <h2 className="font-semibold">Response:</h2>
        <pre className="bg-gray-100 p-3 text-sm overflow-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
      </div>
        </div>
      </section>
    </div>
  );
}

// Made with Bob
