import { MembersCard } from "@/components/dashboard/promo-group/members-card";
import PromoDetailsCard from "@/components/dashboard/promo-group/promo-details-card";
import { Button } from "@/components/ui/button";
import { IconChevronLeft } from "@tabler/icons-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCompanyOptions, getMembers, getPromoGroup } from "../../fetch";

const PromoGroupEditPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const [promoGroup, companyOptions, allMembers] = await Promise.all([
    getPromoGroup(id),
    getCompanyOptions(),
    getMembers(),
  ]);

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
          <Link href="/promo-group">
            <IconChevronLeft />
            Back
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <MembersCard
          members={promoGroup.members}
          allMembers={allMembers}
          companyOptions={companyOptions}
        />
        <PromoDetailsCard promos={promoGroup.promos} promoGroupId={id} />
      </div>
    </div>
  );
};

export default PromoGroupEditPage;
