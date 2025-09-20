

import React from 'react';
// FIX: Use named import for Link from react-router-dom.
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 text-center">
      <h1 className="text-6xl font-bold text-indigo-600">404</h1>
      <h2 className="text-2xl font-semibold text-slate-800 mt-4">Page Not Found</h2>
      <p className="text-slate-600 mt-2">Sorry, the page you are looking for does not exist.</p>
      {/* FIX: Use the Link component directly. */}
      <Link
        to="/"
        className="mt-8 px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition"
      >
        Go Home
      </Link>
    </div>
  );
};

export default NotFoundPage;