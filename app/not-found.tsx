'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F3EDE2] p-6 text-center">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-[#EBE3D5]">
        <h2 className="text-3xl font-bold text-[#123B2B] mb-2">404</h2>
        <p className="text-base font-semibold text-gray-800 mb-1">Page Not Found</p>
        <p className="text-sm text-gray-600 mb-6">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-2.5 rounded-xl bg-[#123B2B] text-white font-semibold text-sm hover:bg-[#0c281d] transition-colors"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
