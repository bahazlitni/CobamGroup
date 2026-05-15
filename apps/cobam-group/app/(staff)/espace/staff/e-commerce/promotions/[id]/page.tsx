import PromotionEditorPage from "@/components/staff/ecommerce/PromotionEditorPage";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <PromotionEditorPage promotionId={id} />;
}
