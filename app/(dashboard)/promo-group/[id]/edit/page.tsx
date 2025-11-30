import { MembersCard } from "@/components/dashboard/promo-group/members-card";
import PromoDetailsCard from "@/components/dashboard/promo-group/promo-details-card";
import { Button } from "@/components/ui/button";
import { getCompanyOptions } from "@/server/general";
import { SearchParams } from "@/types";
import { IconChevronLeft } from "@tabler/icons-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getPromoGroupMembersById,
  getPromoGroupPromosById,
  getPromoGroupsById,
} from "../../fetch";

const PromoGroupEditPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<SearchParams>;
}) => {
  const { id } = await params;
  const { search } = await searchParams;

  const [promoGroupPromo, companyOptions, allMembers, promoGroup] =
    await Promise.all([
      getPromoGroupPromosById(id, { limit: "10", search }),
      getCompanyOptions(),
      getPromoGroupMembersById({ promo_group_id: id, limit: "10" }),
      getPromoGroupsById(id),
    ]);

  if (!promoGroup) {
    return notFound();
  }

  if (promoGroup.error) {
    return <div>{promoGroup.error}</div>;
  }

  if (promoGroup.status !== 200) {
    return <div>Failed to load data</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{promoGroup.data.name}</h1>
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
          members={allMembers.data || []}
          companyOptions={companyOptions}
          promoGroupId={id}
        />
        <PromoDetailsCard
          promos={promoGroupPromo.data}
          promoGroupId={id}
          pageCount={promoGroupPromo.pagination?.total_pages || 1}
        />
      </div>
    </div>
  );
};

export default PromoGroupEditPage;
