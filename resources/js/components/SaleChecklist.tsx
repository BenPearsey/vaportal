import Checklist from "./Checklist";

export default function SaleChecklist({ saleId, checklist }: { saleId: number; checklist: any[] }) {
  return <Checklist entityId={saleId} checklist={checklist} updateRoute="admin.sales.checklist" />;
}
