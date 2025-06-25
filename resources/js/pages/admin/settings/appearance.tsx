/* Admin » Settings » Appearance */
import { Head }               from '@inertiajs/react';
import AppLayout              from '@/layouts/app-layout-admin';
import AdminSettingsLayout    from '@/layouts/settings/layout-admin';
import AppearanceTabs         from '@/components/appearance-tabs';
import HeadingSmall           from '@/components/heading-small';

export default function AdminAppearance(){
  return(
    <AppLayout breadcrumbs={[
      {title:'Settings',  href:'/admin/settings/appearance'},
      {title:'Appearance',href:'#'},
    ]}>
      <Head title="Appearance settings"/>

      <AdminSettingsLayout>
        <HeadingSmall title="Appearance settings"
                      description="Theme & colour preferences"/>
        <AppearanceTabs/>
      </AdminSettingsLayout>
    </AppLayout>
  );
}
