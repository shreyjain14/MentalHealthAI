'use client';

import React from 'react';
import Link from 'next/link';

const CrisisMode = () => {
  const emergencyNumbers = [
    { name: 'National Emergency Number', number: '112' },
    { name: 'Mental Health Helpline (KIRAN)', number: '1800-599-0019' },
    { name: 'Suicide Prevention Helpline (AASRA)', number: '91-9820466726' },
    { name: 'Women Helpline', number: '1091' },
    { name: 'Child Helpline', number: '1098' },
    { name: 'Senior Citizen Helpline', number: '14567' },
  ];

  const therapistResources = [
    {
      name: 'Practo',
      url: 'https://www.practo.com/counselling-psychology',
      description: 'Find and book appointments with mental health professionals'
    },
    {
      name: 'Tata 1mg',
      url: 'https://www.1mg.com/doctors/psychologist',
      description: 'Search for psychologists and counselors near you'
    },
    {
      name: 'YourDOST',
      url: 'https://yourdost.com',
      description: 'Online counseling and emotional support platform'
    },
  ];

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-red-500 mb-8">Crisis Support</h1>
        
        <div className="bg-gray-900 rounded-lg shadow-lg p-6 mb-8 border border-gray-800">
          <h2 className="text-2xl font-semibold mb-4 text-white">Emergency Helpline Numbers</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {emergencyNumbers.map((item, index) => (
              <div key={index} className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-pink-600 transition-colors duration-200">
                <h3 className="font-medium text-gray-200">{item.name}</h3>
                <a
                  href={`tel:${item.number}`}
                  className="text-xl text-pink-500 hover:text-pink-400 font-bold block mt-1"
                >
                  {item.number}
                </a>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg shadow-lg p-6 border border-gray-800">
          <h2 className="text-2xl font-semibold mb-4 text-white">Find a Therapist</h2>
          <div className="space-y-4">
            {therapistResources.map((resource, index) => (
              <div key={index} className="border-b border-gray-700 pb-4 last:border-b-0">
                <h3 className="font-medium text-lg text-gray-200">{resource.name}</h3>
                <p className="text-gray-400 mb-2">{resource.description}</p>
                <Link
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-500 hover:text-pink-400 font-medium inline-flex items-center"
                >
                  Visit Website 
                  <svg 
                    className="w-4 h-4 ml-1" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-400">
            If you&apos;re experiencing a medical emergency, please dial <span className="text-red-500 font-bold">112</span> immediately.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CrisisMode; 