import '../css/app.css';

import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { InertiaProgress } from '@inertiajs/progress';     // slim bar on top
import { Toaster, toast } from 'react-hot-toast';          // pop-up messages
import { route as routeFn } from 'ziggy-js';
import { initializeTheme } from './hooks/use-appearance';

declare global { const route: typeof routeFn; }

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

/* ─── Progress bar — shows after 250 ms ─── */
InertiaProgress.init({ delay: 250, color: '#4B5563', showSpinner: false });

createInertiaApp({
    title: title => `${title} – ${appName}`,
    resolve: name =>
        resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        /* global toast on every successful POST/PUT/DELETE */
        router.on('finish', e => {
            if (e.detail.visit.completed && ['post', 'put', 'delete'].includes(e.detail.visit.method))
                toast.success('Saved!');
        });

        createRoot(el).render(
            <>
                <App {...props} />
                <Toaster position="top-right" gutter={8} />
            </>
        );
    },
    /* We run our own progress bar, so disable Inertia’s fallback */
    progress: false,
});

initializeTheme();
