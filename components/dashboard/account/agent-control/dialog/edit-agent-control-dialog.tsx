"use client";

import { editAgent } from "@/app/(dashboard)/account/agent-overview/agent-control/actions";
import { AgentControl } from "@/app/(dashboard)/account/agent-overview/agent-control/types";
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
import { AgentControlForm } from "../form/agent-control-form";

export const editAgentSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
});

export type EditAgentSchema = z.infer<typeof editAgentSchema>;

interface EditAgentControlDialogProps
  extends React.ComponentPropsWithRef<typeof Dialog> {
  agent: AgentControl | null;
}

const EditAgentControlDialog = ({
  agent,
  ...props
}: EditAgentControlDialogProps) => {
  const [isPending, startTransition] = React.useTransition();

  console.log({
    name: agent?.name,
    email: agent?.email,
    phone: agent?.phone_number,
  });

  const form = useForm<EditAgentSchema>({
    resolver: zodResolver(editAgentSchema),
    defaultValues: {
      name: agent?.name ?? "",
      email: agent?.email,
      phone: agent?.phone_number,
    },
  });

  function onSubmit(input: EditAgentSchema) {
    startTransition(async () => {
      if (!agent) return;

      const { success } = await editAgent({
        id: String(agent.id),
        ...input,
      });

      if (!success) {
        toast.error("Failed to edit agent");
        return;
      }

      form.reset(input);
      props.onOpenChange?.(false);
      toast.success("Agent edited");
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
        <AgentControlForm<EditAgentSchema> form={form} onSubmit={onSubmit}>
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
        </AgentControlForm>
      </DialogContent>
    </Dialog>
  );
};

export default EditAgentControlDialog;
