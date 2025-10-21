"use client";

import { editPromoGroupMembers } from "@/app/(dashboard)/promo-group/actions";
import { PromoGroupMembers } from "@/app/(dashboard)/promo-group/types";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Option } from "@/types/data-table";
import { X } from "lucide-react";
import React from "react";
import { toast } from "sonner";
import AddAgentCompanyDialog from "./dialog/add-agent-company-dialog";
import AddMemberPromoGroupDialog from "./dialog/add-member-promo-group-dialog";

interface MembersCardProps {
  members: PromoGroupMembers[];
  allMembers: PromoGroupMembers[];
  companyOptions: Option[];
}

export function MembersCard({
  members,
  allMembers,
  companyOptions,
}: MembersCardProps) {
  const [localMembers, setLocalMembers] =
    React.useState<PromoGroupMembers[]>(members);

  const [openSaveDialog, setOpenSaveDialog] = React.useState(false);
  const [isSavePending, startSaveTransition] = React.useTransition();

  const onAddAgentCompany = () => {
    console.log("Add agent company clicked");
  };

  const onSaveChanges = () => {
    startSaveTransition(async () => {
      toast.promise(editPromoGroupMembers("1", localMembers), {
        success: (data) => data.message,
        error: "Failed to edit members",
      });
      setOpenSaveDialog(false);
      console.log("Save changes clicked");
    });
  };

  const onRemoveMember = (id: number) => {
    setLocalMembers((prevMembers) =>
      prevMembers.filter((member) => member.id !== id)
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Members</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Action Buttons */}
        <div className="flex gap-2">
          <AddMemberPromoGroupDialog
            onAdd={(member) =>
              setLocalMembers((prev) => {
                if (prev.some((m) => m.id === member.id)) return prev;
                return [...prev, member];
              })
            }
            companyOptions={companyOptions}
            members={allMembers}
          />
          <AddAgentCompanyDialog
            companyOptions={companyOptions}
            members={allMembers}
            onAddMany={(newMembers) =>
              setLocalMembers((prev) => {
                const existingIds = new Set(prev.map((m) => m.id));
                const merged = [...prev];
                for (const m of newMembers) {
                  if (!existingIds.has(m.id)) merged.push(m);
                }
                return merged;
              })
            }
          />
        </div>

        {/* Members List */}
        <div className="space-y-2">
          {localMembers.length === 0 && (
            <div className="text-sm text-muted-foreground py-4 text-center">
              No members found.
            </div>
          )}
          {localMembers.map((member, index) => (
            <div
              key={member.id}
              className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0"
            >
              <span className="text-sm">
                {index + 1}.{" "}
                <span className="font-semibold">{member.name}</span> |{" "}
                {member.agent_company}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                onClick={() => onRemoveMember?.(member.id)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Save Changes Button */}
        <div className="pt-4">
          <Button
            size="sm"
            className="text-xs "
            onClick={() => setOpenSaveDialog(true)}
          >
            Save Changes
          </Button>
          <ConfirmationDialog
            open={openSaveDialog}
            onOpenChange={setOpenSaveDialog}
            onConfirm={onSaveChanges}
            onCancel={() => setOpenSaveDialog(false)}
            isLoading={isSavePending}
          />
        </div>
      </CardContent>
    </Card>
  );
}
