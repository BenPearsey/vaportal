/* agent » Settings » Profile */
import { Head, useForm, usePage } from '@inertiajs/react';
import { Transition }             from '@headlessui/react';

import AppLayout           from '@/layouts/app-layout-agent';
import AgentSettingsLayout from '@/layouts/settings/layout-agent';
import HeadingSmall        from '@/components/heading-small';
import InputError          from '@/components/input-error';
import { Button }          from '@/components/ui/button';
import { Input }           from '@/components/ui/input';
import { Label }           from '@/components/ui/label';

interface AgentProfile {
  firstname: string;
  lastname : string;
  phone    : string | null;
  email    : string;
  address  : string;
  city     : string;
  state    : string;
  zipcode  : string;
}

export default function AgentProfile()
{
  /* ------------------------------------------------------------------
   * Wait until Inertia gives us the profile prop – otherwise show nothing
   * ------------------------------------------------------------------ */
  const { profile } = usePage<Partial<{ profile: AgentProfile }>>().props;
  if (!profile) return null;                         // ←- guard against “undefined”

  /* form -------------------------------------------------------------- */
  const { data, setData, patch, errors, processing, recentlySuccessful } =
    useForm({
      firstname : profile.firstname,
      lastname  : profile.lastname,
      phone     : profile.phone ?? '',
      email     : profile.email,
      address   : profile.address,
      city      : profile.city,
      state     : profile.state,
      zipcode   : profile.zipcode,
    });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    patch(route('agent.profile.update'));
  }

  /* ------------------------------------------------------------------ */
  return (
    <AppLayout breadcrumbs={[
      { title:'Settings', href:'/agent/settings/profile' },
      { title:'Profile',  href:'#'                       },
    ]}>
      <Head title="Profile settings" />

      <AgentSettingsLayout>
        <HeadingSmall
          title="Profile information"
          description="Update your agent account details"
        />

        <form onSubmit={submit} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>First name</Label>
              <Input value={data.firstname}
                     onChange={e=>setData('firstname',e.target.value)} />
              <InputError message={errors.firstname} />
            </div>

            <div>
              <Label>Last name</Label>
              <Input value={data.lastname}
                     onChange={e=>setData('lastname',e.target.value)} />
              <InputError message={errors.lastname} />
            </div>
          </div>

          <div>
            <Label>Phone</Label>
            <Input value={data.phone}
                   onChange={e=>setData('phone',e.target.value)} />
            <InputError message={errors.phone} />
          </div>

          <div>
            <Label>Email address</Label>
            <Input type="email" value={data.email}
                   onChange={e=>setData('email',e.target.value)} />
            <InputError message={errors.email} />
          </div>

          <Button disabled={processing}>
            {processing ? 'Saving…' : 'Save'}
          </Button>

          <Transition
            show={recentlySuccessful}
            enter="transition ease-in-out"
            enterFrom="opacity-0"
            leave="transition ease-in-out"
            leaveTo="opacity-0"
          >
            <p className="text-sm text-neutral-600">Saved</p>
          </Transition>
        </form>
      </AgentSettingsLayout>
    </AppLayout>
  );
}
