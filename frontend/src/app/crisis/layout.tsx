import React from 'react';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'Crisis Support | Emergency Helpline Numbers & Mental Health Resources',
  description: 'Access emergency helpline numbers and find mental health professionals in India. Immediate crisis support and resources available 24/7.',
  keywords: 'crisis support, mental health helpline, emergency numbers, suicide prevention, therapist finder, India helplines',
  openGraph: {
    title: 'Crisis Support | Emergency Helpline Numbers & Mental Health Resources',
    description: 'Access emergency helpline numbers and find mental health professionals in India. Immediate crisis support and resources available 24/7.',
    type: 'website',
  },
};

export default function CrisisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {children}
    </div>
  );
} 