/* agent » Settings » Appearance */
import { Head }               from '@inertiajs/react';

import AppLayout              from '@/layouts/app-layout-agent';
import AgentSettingsLayout    from '@/layouts/settings/layout-agent';

import HeadingSmall           from '@/components/heading-small';
import AppearanceTabs         from '@/components/appearance-tabs';

export default function AgentAppearance() {
  return (
    <AppLayout breadcrumbs={[
      { title:'Settings',   href:'/agent/settings/appearance' },
      { title:'Appearance', href:'#' }
    ]}>
      <Head title="Appearance settings"/>

      <AgentSettingsLayout>
        <HeadingSmall
          title="Appearance settings"
          description="Theme & colour preferences"
        />
        <AppearanceTabs />
      </AgentSettingsLayout>
    </AppLayout>
  );
}
