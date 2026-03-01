'use client';

import { Suspense } from 'react';
import { PendingContent } from './pending-content';

export default function PendingApprovalPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="animate-pulse">
            <div className="w-16 h-16 bg-gray-700 rounded-full mx-auto mb-6" />
            <div className="h-8 bg-gray-700 rounded w-48 mx-auto mb-4" />
            <div className="h-4 bg-gray-700 rounded w-64 mx-auto" />
          </div>
        </div>
      </div>
    }>
      <PendingContent />
    </Suspense>
  );
}
