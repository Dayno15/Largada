import { Suspense } from 'react';
import Checkout from '@/components/checkout';
export default function Page() {
  return (
    <Suspense fallback={<div className="loading-state">Preparando inscrição...</div>}>
      <Checkout />
    </Suspense>
  );
}
