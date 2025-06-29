"use client";

import { createAgent } from "@/app/(dashboard)/account/agent-control/actions";
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
import { AgentControlForm } from "../form/agent-control-form";

export const createAgentSchema = z.object({
  name: z.string(),
  email: z.string(),
  phone: z.string(),
});

export type CreateAgentSchema = z.infer<typeof createAgentSchema>;

const CreateAgentControlDialog = () => {
  const [open, setOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<CreateAgentSchema>({
    resolver: zodResolver(createAgentSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  });

  function onSubmit(input: CreateAgentSchema) {
    startTransition(async () => {
      const { success } = await createAgent(input);

      if (!success) {
        toast.error("Failed to create agent");
        return;
      }

      form.reset();
      setOpen(false);
      toast.success("Agent created");
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus />
          New Agent
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Create Agent</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new agent
          </DialogDescription>
        </DialogHeader>
        <AgentControlForm form={form} onSubmit={onSubmit}>
          <DialogFooter className="gap-2 pt-2 sm:space-x-0">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button disabled={isPending}>
              {isPending && <Loader className="animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </AgentControlForm>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAgentControlDialog;
