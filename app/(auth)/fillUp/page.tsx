'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import ProfileForm from '@/components/profile-form';

export default function FillUp() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push('/logIn'); // redirect if not logged in
      } else {
        setUser(data.session.user);
      }
    };

    checkSession();
  }, [router]);

  if (!user) return <p>Loading...</p>;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    router.push('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center">
      <div className="w-full max-w-lg p-6">
        <ProfileForm className="bg-neutral-300" submitHandler={handleSubmit} />
      </div>
    </div>
  );
}
