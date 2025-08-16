import '../css/app.css';

import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { route as routeFn } from 'ziggy-js';
import { initializeTheme } from './hooks/use-appearance';

import { InertiaProgress } from '@inertiajs/progress';
import { Toaster } from 'sonner';

declare global { const route: typeof routeFn; }

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

InertiaProgress.init({ delay: 250, color: '#4B5563', showSpinner: false });

createInertiaApp({
  title: title => `${title} - ${appName}`,
  resolve: name => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
  setup({ el, App, props }) {
    const root = createRoot(el);
    root.render(
      <>
        <App {...props} />
        <Toaster position="top-right" richColors closeButton />
      </>
    );
  },
});

initializeTheme();
