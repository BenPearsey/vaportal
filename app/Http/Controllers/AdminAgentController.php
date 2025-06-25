<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Agent;
use App\Models\AgentDocument;
use App\Models\AgentNote;
use App\Models\AgentDocumentFolder;
use App\Models\Client;
use App\Models\Sale;
use Inertia\Inertia;
use Illuminate\Support\Str;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use App\Mail\NewAgentWelcomeMail;
use Illuminate\Support\Facades\Log;

class AdminAgentController extends Controller
{
    /* ───────────────────────── Create form ───────────────────────── */
    public function create()
    {
        return Inertia::render('admin/add-agent', [
            'agents' => Agent::all(),
        ]);
    }

    /* ───────────────────────── Store new agent ───────────────────── */
    public function store(Request $request)
    {
        // ensure blank upline becomes NULL
        $request->merge([
            'upline_agent_id' => $request->input('upline_agent_id') ?: null,
        ]);

        $validated = $request->validate([
            'firstname'        => 'required|string|max:255',
            'lastname'         => 'required|string|max:255',
            'email'            => 'required|email|unique:agents,email',
            'phone'            => 'nullable|string|max:20',
            'address'          => 'nullable|string|max:255',
            'city'             => 'nullable|string|max:255',
            'zipcode'          => 'nullable|string|max:10',
            'company'          => 'nullable|string|max:255',
            'upline_agent_id'  => 'nullable|integer|exists:agents,agent_id',
            'create_user'      => 'sometimes|boolean',
        ]);

                /* ---------- DEFAULT CHECKLIST ITEMS ---------- */
                $defaultChecklist = [
                    ['label' => 'Send SureLC Registration Link',              'done' => false],
                    ['label' => 'Send Carrier Appointment Links',             'done' => false],
                    ['label' => 'Send Welcome Email w/ Portal Registration',  'done' => false],
                    ['label' => 'Set Welcome Call',                           'done' => false],
                ];
                /* --------------------------------------------- */

        /* ----- create user account first if requested ----- */
        $userId       = null;
        $tempPassword = null;

        if ($request->boolean('create_user')) {
            $tempPassword = Str::random(8);

            $user = User::create([
                'email'    => $validated['email'],
                'password' => Hash::make($tempPassword),
                'role'     => 'agent',
            ]);

            $userId = $user->id;
        }

        /* ----- create the agent record ----- */

        $agent = Agent::create(array_merge(
            $validated,
            ['user_id' => $userId, 'checklist' => $defaultChecklist]
        ));

        /* ----- send welcome e-mail if user was created ----- */
        if ($userId) {
            try {
                Mail::to($agent->email)->send(new NewAgentWelcomeMail($agent, $tempPassword));
            } catch (\Throwable $e) {
                Log::error('Agent welcome e-mail failed: ' . $e->getMessage());
            }
        }

        return redirect()
            ->route('admin.agents')
            ->with('success', 'Agent saved.');
    }

      /* ───────────────────────── Toggle checklist item ─────────────── */
      public function updateChecklist(Request $r, Agent $agent)
      {
          $data = $r->validate([
              'index' => 'required|integer|min:0',
              'done'  => 'required|boolean',
          ]);
  
          $list = $agent->checklist ?? [];
          if (!isset($list[$data['index']])) {
              return response()->json(['error' => 'Item not found'], 404);
          }
  
          $list[$data['index']]['done'] = $data['done'];
          $agent->checklist = $list;
          $agent->save();
  
          return response()->noContent();
        }

    /* ───────────────────────── Convert to user later ───────────────── */
    public function makeUser(Agent $agent)
    {
        if ($agent->user_id) {
            return back()->with('error', 'Agent already has a user.');
        }

        $tempPassword = Str::random(8);

        $user = User::create([
            'email'    => $agent->email,
            'password' => Hash::make($tempPassword),
            'role'     => 'agent',
        ]);

        $agent->update(['user_id' => $user->id]);

        try {
            Mail::to($agent->email)->send(new NewAgentWelcomeMail($agent, $tempPassword));
        } catch (\Throwable $e) {
            Log::error('Agent welcome e-mail failed: ' . $e->getMessage());
        }

        return back()->with('success', 'Portal user created and e-mail sent.');
    }

    /* ───────────────────────── Index list ─────────────────────────── */
    public function agents()
    {
        $agents = Agent::with('upline:agent_id,firstname,lastname')->get();
        return Inertia::render('admin/agents', ['agents' => $agents]);
    }

    /* ───────────────────────── Overview page ──────────────────────── */
    public function overview(Agent $agent)
    {
        $agent->load(['upline:agent_id,firstname,lastname', 'clients']);

        return Inertia::render('admin/agent-overview', [
            'agent'     => $agent,
            'documents' => AgentDocument::where('agent_id', $agent->agent_id)->get(),
            'notes'     => AgentNote::where('agent_id', $agent->agent_id)->get(),
            'folders'   => AgentDocumentFolder::where('agent_id', $agent->agent_id)->get(),
            'sales'     => Sale::where('agent_id', $agent->agent_id)->get(),
            'clients'   => Client::where('agent_id', $agent->agent_id)->get(),
        ]);
    }

    /* ───────────────────────── Edit / update ──────────────────────── */
    public function edit(Agent $agent)
    {
        return Inertia::render('admin/agents/edit', ['agent' => $agent]);
    }

    public function update(Request $request, Agent $agent)
    {
        $request->merge([
            'upline_agent_id' => $request->input('upline_agent_id') ?: null,
        ]);

        $validated = $request->validate([
            'firstname'        => 'required|string|max:255',
            'lastname'         => 'required|string|max:255',
            'email'            => 'required|email|unique:agents,email,' . $agent->agent_id . ',agent_id',
            'phone'            => 'nullable|string|max:20',
            'address'          => 'nullable|string|max:255',
            'city'             => 'nullable|string|max:255',
            'zipcode'          => 'nullable|string|max:10',
            'company'          => 'nullable|string|max:255',
            'upline_agent_id'  => 'nullable|integer|exists:agents,agent_id',
        ]);

        $agent->update($validated);

        return redirect()
            ->route('admin.agents.overview', $agent)
            ->with('success', 'Agent updated.');
    }

    /* ───────────────────────── Delete ─────────────────────────────── */
    public function destroy(Agent $agent)
    {
        $agent->delete();

        return redirect()
            ->route('admin.agents')
            ->with('success', 'Agent deleted.');
    }
}
