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

export const editAgentSchema = z.object({
  full_name: z.string().optional(),
  agent_company: z.string().optional(),
  promo_group_id: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  is_active: z.boolean().optional(),
});

export type EditAgentSchema = z.infer<typeof editAgentSchema>;

interface EditAgentDialogProps
  extends React.ComponentPropsWithRef<typeof Dialog> {
  agent: Agent | null;
}

const EditAgentDialog = ({ agent, ...props }: EditAgentDialogProps) => {
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
    },
  });

  function onSubmit(input: EditAgentSchema) {
    startTransition(async () => {
      if (!agent) return;
      const { success, message } = await editAgent({
        id: agent.id,
        ...input,
      });
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
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit Agent</DialogTitle>
          <DialogDescription>
            Edit details below and save the changes
          </DialogDescription>
        </DialogHeader>
        <AgentForm<EditAgentSchema>
          form={form}
          onSubmit={onSubmit}
          // TODO: fetch promoGroupSelect here, for now just pass an empty array
          promoGroupSelect={[]}
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
