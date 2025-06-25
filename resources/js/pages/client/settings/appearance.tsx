/* client » Settings » Appearance */
import { Head }               from '@inertiajs/react';
import AppLayout              from '@/layouts/app-layout-client';
import ClientSettingsLayout    from '@/layouts/settings/layout-client';
import AppearanceTabs         from '@/components/appearance-tabs';
import HeadingSmall           from '@/components/heading-small';

export default function clientAppearance(){
  return(
    <AppLayout breadcrumbs={[
      {title:'Settings',  href:'/client/settings/appearance'},
      {title:'Appearance',href:'#'},
    ]}>
      <Head title="Appearance settings"/>

      <ClientSettingsLayout>
        <HeadingSmall title="Appearance settings"
                      description="Theme & colour preferences"/>
        <AppearanceTabs/>
      </ClientSettingsLayout>
    </AppLayout>
  );
}
