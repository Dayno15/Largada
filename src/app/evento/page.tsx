import { Suspense } from 'react';
import EventDetail from '@/components/event-detail';
export default function Page() {
  return (
    <Suspense fallback={<div className="loading-state">Carregando evento...</div>}>
      <EventDetail />
    </Suspense>
  );
}
