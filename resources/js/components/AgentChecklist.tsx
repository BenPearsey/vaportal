import Checklist from "./Checklist";

export default function AgentChecklist({ agentId, checklist }: { agentId: number; checklist: any[] }) {
  return <Checklist entityId={agentId} checklist={checklist} updateRoute="admin.agents.checklist" />;
}
