'use client'; // make it client component if you want to read session easily
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const session = supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.push('/logIn');
      } else {
        setUser(data.session.user);
      }
    });
  }, []);

  if (!user) return <p>Loading...</p>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>
        <p className="mb-2">Welcome, {user.email}</p>
        <p className="text-sm text-gray-600">Your Supabase ID: {user.id}</p>
      </div>
    </div>
  );
}
