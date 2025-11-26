'use client'; // make it client component if you want to read session easily
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import ProtectedPage from "@/components/protected-page";

export default function Dashboard() {

  return (
    
    <ProtectedPage>
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-1000">
    </div>
    </ProtectedPage>
  );
}
