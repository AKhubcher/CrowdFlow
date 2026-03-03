import { Analytics } from '@vercel/analytics/react';
import { AppRoutes } from './router';

export default function App() {
  return (
    <>
      <AppRoutes />
      <Analytics />
    </>
  );
}
