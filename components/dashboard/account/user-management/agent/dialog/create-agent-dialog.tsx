"use client";

import { createAgent } from "@/app/(dashboard)/account/user-management/agent/actions";
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
  name: z.string(),
  company: z.string(),
  promo_group: z.string(),
  email: z.string().email(),
  phone: z.string(),
  status: z.boolean(),
});

export type CreateAgentSchema = z.infer<typeof createAgentSchema>;

const CreateAgentDialog = () => {
  const [open, setOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<CreateAgentSchema>({
    resolver: zodResolver(createAgentSchema),
    defaultValues: {
      name: "",
      company: "",
      promo_group: "",
      email: "",
      phone: "",
      status: true,
    },
  });

  function onSubmit(input: CreateAgentSchema) {
    startTransition(async () => {
      const { success, message } = await createAgent(input);
      if (!success) {
        toast.error("Failed to create agent");
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
        <AgentForm form={form} onSubmit={onSubmit}>
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
