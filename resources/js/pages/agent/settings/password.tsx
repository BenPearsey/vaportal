/* agent » Settings » Password */
import { Head, useForm }   from '@inertiajs/react';
import { Transition }      from '@headlessui/react';
import { useRef }          from 'react';

import AppLayout           from '@/layouts/app-layout-agent';
import AgentSettingsLayout from '@/layouts/settings/layout-agent';

import HeadingSmall from '@/components/heading-small';
import InputError    from '@/components/input-error';
import { Button }    from '@/components/ui/button';
import { Input }     from '@/components/ui/input';
import { Label }     from '@/components/ui/label';

export default function AgentPassword() {
  const currentRef = useRef<HTMLInputElement>(null);
  const newRef     = useRef<HTMLInputElement>(null);

  const { data, setData, put, processing, errors, reset, recentlySuccessful } =
    useForm({
      current_password       : '',
      password               : '',
      password_confirmation  : '',
    });

  const submit = (e:React.FormEvent) => {
    e.preventDefault();
    put(route('password.update'), {
      onSuccess: () => reset(),
      onError  : err => {
        if (err.password)          newRef.current?.focus();
        if (err.current_password)  currentRef.current?.focus();
      }
    });
  };

  return (
    <AppLayout breadcrumbs={[
      { title:'Settings', href:'/agent/settings/password' },
      { title:'Password', href:'#' }
    ]}>
      <Head title="Update password"/>

      <AgentSettingsLayout>
        <HeadingSmall
          title="Update password"
          description="Ensure your account is using a long, random password"
        />

        <form onSubmit={submit} className="space-y-6">
          {/* current */}
          <div className="grid gap-2">
            <Label htmlFor="current">Current password</Label>
            <Input id="current" type="password"
                   ref={currentRef}
                   value={data.current_password}
                   onChange={e=>setData('current_password',e.target.value)}/>
            <InputError message={errors.current_password}/>
          </div>

          {/* new */}
          <div className="grid gap-2">
            <Label htmlFor="password">New password</Label>
            <Input id="password" type="password"
                   ref={newRef}
                   value={data.password}
                   onChange={e=>setData('password',e.target.value)}/>
            <InputError message={errors.password}/>
          </div>

          {/* confirm */}
          <div className="grid gap-2">
            <Label htmlFor="confirm">Confirm password</Label>
            <Input id="confirm" type="password"
                   value={data.password_confirmation}
                   onChange={e=>setData('password_confirmation',e.target.value)}/>
            <InputError message={errors.password_confirmation}/>
          </div>

          <Button disabled={processing}>
            {processing ? 'Saving…' : 'Save password'}
          </Button>

          <Transition show={recentlySuccessful}
                      enter="transition-opacity duration-150"
                      enterFrom="opacity-0"
                      leave="transition-opacity duration-150"
                      leaveTo="opacity-0">
            <p className="text-sm text-neutral-600">Saved</p>
          </Transition>
        </form>
      </AgentSettingsLayout>
    </AppLayout>
  );
}
