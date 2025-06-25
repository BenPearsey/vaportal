/* Admin » Settings » Password */
import { Head, useForm }        from '@inertiajs/react';
import { Transition }           from '@headlessui/react';
import { useRef }               from 'react';
import AppLayout                from '@/layouts/app-layout-admin';
import AdminSettingsLayout      from '@/layouts/settings/layout-admin';
import HeadingSmall             from '@/components/heading-small';
import InputError               from '@/components/input-error';
import { Button }               from '@/components/ui/button';
import { Input }                from '@/components/ui/input';
import { Label }                from '@/components/ui/label';

export default function AdminPassword() {
  const currentRef = useRef<HTMLInputElement>(null);
  const newRef     = useRef<HTMLInputElement>(null);

  const { data, setData, put, processing, errors, reset, recentlySuccessful } = useForm({
    current_password:'',
    password:'',
    password_confirmation:'',
  });

  function submit(e:React.FormEvent){
    e.preventDefault();
    put(route('admin.password.update'),{
      onSuccess:()=>reset(),
      onError:err=>{
        if(err.password){ newRef.current?.focus(); }
        if(err.current_password){ currentRef.current?.focus(); }
      }
    });
  }

  return (
    <AppLayout breadcrumbs={[
      {title:'Settings', href:'/admin/settings/password'},
      {title:'Password', href:'#'},
    ]}>
      <Head title="Update password"/>

      <AdminSettingsLayout>
        <HeadingSmall title="Update password"
                      description="Use a long, random password to stay secure"/>

        <form onSubmit={submit} className="space-y-6">
          <div>
            <Label>Current password</Label>
            <Input type="password" ref={currentRef}
                   value={data.current_password}
                   onChange={e=>setData('current_password',e.target.value)}/>
            <InputError message={errors.current_password}/>
          </div>

          <div>
            <Label>New password</Label>
            <Input type="password" ref={newRef}
                   value={data.password}
                   onChange={e=>setData('password',e.target.value)}/>
            <InputError message={errors.password}/>
          </div>

          <div>
            <Label>Confirm password</Label>
            <Input type="password"
                   value={data.password_confirmation}
                   onChange={e=>setData('password_confirmation',e.target.value)}/>
            <InputError message={errors.password_confirmation}/>
          </div>

          <Button disabled={processing}>
            {processing ? 'Saving…':'Save password'}
          </Button>

          <Transition show={recentlySuccessful}
                      enter="transition ease-in-out" leave="transition ease-in-out"
                      enterFrom="opacity-0" leaveTo="opacity-0">
            <p className="text-sm text-neutral-600">Saved</p>
          </Transition>
        </form>
      </AdminSettingsLayout>
    </AppLayout>
  );
}
