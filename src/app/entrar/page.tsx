import { Suspense } from 'react';
import Login from '@/components/login';
export default function Page() {
  return (
    <Suspense fallback={<div className="loading-state">Carregando acesso...</div>}>
      <Login />
    </Suspense>
  );
}
