import { MembersCard } from "@/components/dashboard/promo-group/members-card";
import PromoDetailsCard from "@/components/dashboard/promo-group/promo-details-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPromoGroup } from "../../fetch";

const PromoGroupEditPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const [promoGroup] = await Promise.all([getPromoGroup(id)]);

  if (!promoGroup) {
    return notFound();
  }

  // return <div>PromoGroupEditPage {id}</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{promoGroup.name}</h1>
      </div>
      <div className="flex items-center justify-between">
        <Button asChild>
          <Link href="/promo-group">Select Promo Group</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <MembersCard
          members={[
            { id: "1", name: "Muhammad Abduraffi", company: "Esensi Tech" },
            { id: "2", name: "Kelvin Setiono", company: "Esensi Tech" },
            { id: "3", name: "Eugenia Caroline", company: "Esensi Tech" },
            { id: "4", name: "Maulana", company: "Esensi Tech" },
            { id: "5", name: "Hecky Riadi", company: "Esensi Tech" },
          ]}
        />
        <PromoDetailsCard promos={promoGroup.promos} />
      </div>
    </div>
  );
};

export default PromoGroupEditPage;
