"use client";

import { editAgent } from "@/app/(dashboard)/account/agent-overview/agent-management/actions";
import { Agent } from "@/app/(dashboard)/account/agent-overview/agent-management/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { AgentForm } from "../form/agent-form";
import { PromoGroup } from "@/app/(dashboard)/promo-group/types";

export const editAgentSchema = z.object({
  full_name: z.string(),
  agent_company: z.string(),
  promo_group_id: z.string(),
  email: z.string().email(),
  phone: z
    .string()
    .min(8, "Phone number must be at least 8 characters")
    .regex(
      /^\+\d+$/,
      "Phone number must start with a country code (e.g., +62) followed by digits only"
    ),
  is_active: z.boolean(),
  kakao_talk_id: z.string().optional(),
  photo_selfie: z.instanceof(File).optional(),
  photo_id_card: z.instanceof(File).optional(),
  certificate: z.instanceof(File).optional(),
  name_card: z.instanceof(File).optional(),
});

export type EditAgentSchema = z.infer<typeof editAgentSchema>;

interface EditAgentDialogProps
  extends React.ComponentPropsWithRef<typeof Dialog> {
  agent: Agent | null;
  promoGroupSelect: PromoGroup[];
}

const EditAgentDialog = ({
  agent,
  promoGroupSelect,
  ...props
}: EditAgentDialogProps) => {
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<EditAgentSchema>({
    resolver: zodResolver(editAgentSchema),
    defaultValues: {
      full_name: agent?.name || "",
      agent_company: agent?.agent_company_name,
      promo_group_id: String(agent?.promo_group_id) || "0",
      email: agent?.email,
      phone: agent?.phone_number,
      is_active: agent?.status === "Active" ? true : false,
      kakao_talk_id: agent?.kakao_talk_id,
      photo_selfie: undefined,
      photo_id_card: undefined,
      certificate: undefined,
      name_card: undefined,
    },
  });

  function onSubmit(input: EditAgentSchema) {
    startTransition(async () => {
      if (!agent) return;

      // Create FormData for multipart upload
      const fd = new FormData();
      fd.append("user_id", String(agent.id));

      // Only add fields that have values
      fd.append("full_name", input.full_name);
      fd.append("agent_company", input.agent_company);
      fd.append("promo_group_id", input.promo_group_id);
      fd.append("email", input.email);
      fd.append("phone", input.phone);
      if (input.kakao_talk_id) fd.append("kakao_talk_id", input.kakao_talk_id);
      if (input.is_active !== undefined)
        fd.append("is_active", String(input.is_active));

      // Only add image files if new files were selected
      if (input.photo_selfie instanceof File)
        fd.append("photo_selfie", input.photo_selfie);
      if (input.photo_id_card instanceof File)
        fd.append("photo_id_card", input.photo_id_card);
      if (input.certificate instanceof File)
        fd.append("certificate", input.certificate);
      if (input.name_card instanceof File)
        fd.append("name_card", input.name_card);

      const { success, message } = await editAgent(fd);
      if (!success) {
        toast.error(message || "Failed to edit agent");
        return;
      }
      form.reset(input);
      props.onOpenChange?.(false);
      toast.success(message || "Agent edited");
    });
  }

  return (
    <Dialog {...props}>
      <DialogContent className="sm:max-w-xl sm:max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Agent</DialogTitle>
          <DialogDescription>
            Edit details below and save the changes
          </DialogDescription>
        </DialogHeader>
        <AgentForm<EditAgentSchema>
          isEditMode={true}
          form={form}
          onSubmit={onSubmit}
          promoGroupSelect={promoGroupSelect}
          existingImages={{
            photo_selfie: agent?.photo_selfie,
            photo_id_card: agent?.photo_id_card,
            certificate: agent?.certificate,
            name_card: agent?.name_card,
          }}
        >
          <DialogFooter className="gap-2 pt-2 sm:space-x-0">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button disabled={isPending}>
              {isPending && <Loader className="animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </AgentForm>
      </DialogContent>
    </Dialog>
  );
};

export default EditAgentDialog;
