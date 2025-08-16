<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\ChecklistTemplate;
use App\Models\ChecklistStage;
use App\Models\ChecklistTask;

class TrustChecklistTemplateSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {
            $tpl = ChecklistTemplate::firstOrCreate(
                ['product' => 'trust', 'version' => '1.0.0'],
                ['title' => 'Trust – Standard Flow', 'status' => 'active', 'created_by' => auth()->id() ?? null]
            );

            $mkStage = function (string $key, string $label, int $order, int $weight) use ($tpl): ChecklistStage {
                return ChecklistStage::firstOrCreate(
                    ['template_id'=>$tpl->id,'key'=>$key],
                    ['label'=>$label,'order'=>$order,'weight'=>$weight]
                );
            };

            $mkTask = function (ChecklistStage $stage, array $data) {
                ChecklistTask::updateOrCreate(
                    ['stage_id' => $stage->id, 'key' => $data['key']],
                    $data + ['stage_id' => $stage->id]
                );
            };

            // 1) Application
            $s1 = $mkStage('application','Application',1,10);
            $mkTask($s1, ['key'=>'client.app.submit','label'=>'Client intake & IDs uploaded','role_scope'=>'client','visibility'=>'all','action_type'=>'file-upload','requires_review'=>true, 'evidence_required'=>true]);
            $mkTask($s1, ['key'=>'admin.app.send_to_drafter','label'=>'Send application packet to drafter (Julie Morris)','role_scope'=>'admin','visibility'=>'admin','action_type'=>'internal']);
            $mkTask($s1, ['key'=>'admin.app.receive_draft','label'=>'Draft received from drafter','role_scope'=>'admin','visibility'=>'admin','action_type'=>'internal']);

            // 2) Payment
            $s2 = $mkStage('payment','Payment',2,15);
            $mkTask($s2, ['key'=>'admin.payment.issue_invoice','label'=>'Issue invoice','role_scope'=>'admin','visibility'=>'all','action_type'=>'internal']);
            $mkTask($s2, ['key'=>'client.payment.submit','label'=>'Client submits payment','role_scope'=>'client','visibility'=>'all','action_type'=>'internal']);
            $mkTask($s2, ['key'=>'admin.payment.vendor.julie_morris','label'=>'Record drafter payment','role_scope'=>'admin','visibility'=>'admin','action_type'=>'internal']);
            $mkTask($s2, ['key'=>'admin.payment.vendor.benson_financial','label'=>'Record vendor payment (Benson Financial)','role_scope'=>'admin','visibility'=>'admin','action_type'=>'internal']);

            // 3) Certificate of Trust
            $s3 = $mkStage('certificate','Certificate of Trust',3,25);
            $mkTask($s3, ['key'=>'admin.certificate.request_drafting','label'=>'Request Certificate drafting','role_scope'=>'admin','visibility'=>'admin','action_type'=>'internal']);
            $mkTask($s3, ['key'=>'admin.certificate.send_to_client','label'=>'Send Certificate to client','role_scope'=>'admin','visibility'=>'all','action_type'=>'internal']);
            $mkTask($s3, ['key'=>'client.certificate.execute_upload','label'=>'Upload executed/notarized Certificate','role_scope'=>'client','visibility'=>'all','action_type'=>'file-upload','requires_review'=>true,'evidence_required'=>true]);
            $mkTask($s3, ['key'=>'client.ein.upload','label'=>'Upload EIN letter','role_scope'=>'client','visibility'=>'all','action_type'=>'file-upload','requires_review'=>true,'evidence_required'=>true]);
            $mkTask($s3, ['key'=>'client.ledger.upload','label'=>'Upload trust ledger','role_scope'=>'client','visibility'=>'all','action_type'=>'file-upload','requires_review'=>true,'evidence_required'=>true]);
            $mkTask($s3, ['key'=>'client.trustee_lease.upload','label'=>'Upload trustee lease','role_scope'=>'client','visibility'=>'all','action_type'=>'file-upload','requires_review'=>true,'evidence_required'=>true]);

            // 4) Operations
            $s4 = $mkStage('operations','Operations Docs',4,40);
            $mkTask($s4, ['key'=>'client.bank.open_upload','label'=>'Upload bank account proof','role_scope'=>'client','visibility'=>'all','action_type'=>'file-upload','requires_review'=>true]);
            // Repeatable asset groups
            foreach (['mvtr'=>'MVTR (Vehicle)','quitclaim'=>'Quitclaim (Real Estate)','bospn'=>'Personal BOSPN'] as $key=>$label) {
                $mkTask($s4, ['key'=>"client.$key.info",'label'=>"$label – information form","role_scope"=>'client','visibility'=>'all','action_type'=>'internal','is_repeatable'=>true,'repeat_group'=>$key]);
                $mkTask($s4, ['key'=>"admin.$key.generate_send",'label'=>"$label – draft & send","role_scope"=>'admin','visibility'=>'all','action_type'=>'internal','is_repeatable'=>true,'repeat_group'=>$key]);
                $mkTask($s4, ['key'=>"client.$key.execute_upload",'label'=>"$label – executed/notarized upload","role_scope"=>'client','visibility'=>'all','action_type'=>'file-upload','requires_review'=>true,'is_repeatable'=>true,'repeat_group'=>$key]);
                $mkTask($s4, ['key'=>"admin.$key.record",'label'=>"$label – record/close","role_scope"=>'admin','visibility'=>'admin','action_type'=>'internal','is_repeatable'=>true,'repeat_group'=>$key]);
            }

            // 5) Closeout
            $s5 = $mkStage('closeout','Closeout',5,10);
            $mkTask($s5, ['key'=>'admin.closeout.send_thank_you','label'=>'Send thank‑you packet','role_scope'=>'admin','visibility'=>'all','action_type'=>'internal']);
            $mkTask($s5, ['key'=>'admin.closeout.schedule_6mo_checkin','label'=>'Schedule 6‑month check‑in','role_scope'=>'admin','visibility'=>'admin','action_type'=>'internal']);
            $mkTask($s5, ['key'=>'admin.closeout.log_royalty','label'=>'Log royalty payment to Thomas Barker','role_scope'=>'admin','visibility'=>'admin','action_type'=>'internal']);
        });
    }
}
