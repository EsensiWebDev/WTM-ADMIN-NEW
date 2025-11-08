"use client";

import { createAgent } from "@/app/(dashboard)/account/agent-overview/agent-management/actions";
import { PromoGroup } from "@/app/(dashboard)/promo-group/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader, Plus } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { AgentForm } from "../form/agent-form";

export const createAgentSchema = z.object({
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
  kakao_talk_id: z.string().min(1).max(25),
  photo_selfie: z.instanceof(File).optional(),
  photo_id_card: z.instanceof(File).optional(),
  certificate: z.instanceof(File).optional(),
  name_card: z.instanceof(File).optional(),
});

export type CreateAgentSchema = z.infer<typeof createAgentSchema>;

const CreateAgentDialog = ({
  promoGroupSelect,
}: {
  promoGroupSelect: PromoGroup[];
}) => {
  const [open, setOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<CreateAgentSchema>({
    resolver: zodResolver(createAgentSchema),
    defaultValues: {
      full_name: "",
      agent_company: "",
      promo_group_id: "",
      email: "",
      phone: "",
      is_active: true, //
      kakao_talk_id: "",
      photo_selfie: undefined,
      photo_id_card: undefined,
      certificate: undefined,
      name_card: undefined,
    },
  });

  function onSubmit(input: CreateAgentSchema) {
    // Check if required file fields are present
    if (
      !input.photo_selfie ||
      !input.photo_id_card ||
      !input.certificate ||
      !input.name_card
    ) {
      toast.error("Please upload all required documents");
      return;
    }

    const fd = new FormData();
    fd.append("full_name", input.full_name);
    fd.append("agent_company", input.agent_company);
    fd.append("promo_group_id", input.promo_group_id);
    fd.append("email", input.email);
    fd.append("phone", input.phone);
    // fd.append("is_active", input.is_active)
    fd.append("kakao_talk_id", input.kakao_talk_id);
    fd.append("photo_selfie", input.photo_selfie);
    fd.append("photo_id_card", input.photo_id_card);
    fd.append("certificate", input.certificate);
    fd.append("name_card", input.name_card);
    fd.append("role", "agent");

    startTransition(async () => {
      const { success, message } = await createAgent(fd);
      if (!success) {
        toast.error(message ?? "Failed to create agent");
        return;
      }
      form.reset();
      setOpen(false);
      toast.success(message || "Agent created");
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus />
          Add
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl sm:max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Create Agent</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new agent
          </DialogDescription>
        </DialogHeader>
        <AgentForm
          form={form}
          onSubmit={onSubmit}
          promoGroupSelect={promoGroupSelect}
        >
          <DialogFooter className="gap-2 pt-2 sm:space-x-0">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button disabled={isPending} type="submit">
              {isPending && <Loader className="animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </AgentForm>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAgentDialog;
