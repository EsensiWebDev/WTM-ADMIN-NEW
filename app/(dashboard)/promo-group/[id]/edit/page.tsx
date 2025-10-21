import { MembersCard } from "@/components/dashboard/promo-group/members-card";
import PromoDetailsCard from "@/components/dashboard/promo-group/promo-details-card";
import { Button } from "@/components/ui/button";
import { IconChevronLeft } from "@tabler/icons-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCompanyOptions,
  getPromoGroupMembersById,
  getPromoGroupPromosById,
} from "../../fetch";

const PromoGroupEditPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const [promoGroup, companyOptions, allMembers] = await Promise.all([
    getPromoGroupPromosById(id, { limit: "10" }),
    getCompanyOptions(),
    getPromoGroupMembersById(id, { limit: "10" }),
  ]);

  if (!promoGroup) {
    return notFound();
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">DUMMY TEXT NAME</h1>
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
          members={[]}
          allMembers={allMembers.data}
          companyOptions={companyOptions}
        />
        <PromoDetailsCard
          promos={promoGroup.data}
          promoGroupId={id}
          pageCount={promoGroup.pagination?.total_pages || 1}
        />
      </div>
    </div>
  );
};

export default PromoGroupEditPage;
