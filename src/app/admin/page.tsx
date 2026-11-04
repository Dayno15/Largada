import { Suspense } from 'react';
import Workspace from '@/components/workspace';
export default function Page() {
  return (
    <Suspense fallback={<div className="loading-state">Carregando administração...</div>}>
      <Workspace role="admin" />
    </Suspense>
  );
}
