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
import { Option } from "@/types/data-table";
import { getCurrencyOptions } from "@/app/(dashboard)/currency/fetch";

export const createAgentSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  agent_company: z.string().optional(),
  promo_group_id: z.string().optional(),
  email: z.string().email("Invalid email format").min(1, "Email is required"),
  phone: z
    .string()
    .min(8, "Phone number must be at least 8 characters")
    .max(15, "Phone number must be at most 15 characters"),
  currency: z.string().min(1, "Currency is required"),
  is_active: z.boolean(),
  kakao_talk_id: z.string().min(1, "KakaoTalk ID is required").max(25),
  photo_selfie: z
    .instanceof(File, { message: "This field is required" })
    .refine((file) => file instanceof File, {
      message: "This field is required",
      path: ["photo_selfie"],
    }),
  photo_id_card: z
    .instanceof(File, { message: "This field is required" })
    .refine((file) => file instanceof File, {
      message: "This field is required",
      path: ["photo_id_card"],
    }),
  certificate: z.instanceof(File).optional(),
  name_card: z
    .instanceof(File, { message: "This field is required" })
    .refine((file) => file instanceof File, {
      message: "This field is required",
      path: ["name_card"],
    }),
});

export type CreateAgentSchema = z.infer<typeof createAgentSchema>;

const CreateAgentDialog = ({
  promoGroupSelect,
  countryOptions,
}: {
  promoGroupSelect: PromoGroup[];
  countryOptions: Option[];
}) => {
  const [open, setOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();
  const [currencyOptions, setCurrencyOptions] = React.useState<Option[]>([]);

  React.useEffect(() => {
    getCurrencyOptions().then((options) => {
      setCurrencyOptions(options);
    });
  }, []);

  const form = useForm<CreateAgentSchema>({
    resolver: zodResolver(createAgentSchema),
    defaultValues: {
      full_name: "",
      agent_company: "",
      promo_group_id: "",
      email: "",
      phone: "",
      currency: "IDR",
      is_active: true, //
      kakao_talk_id: "",
      photo_selfie: undefined,
      photo_id_card: undefined,
      certificate: undefined,
      name_card: undefined,
    },
  });

  function onSubmit(input: CreateAgentSchema) {
    const fd = new FormData();
    fd.append("full_name", input.full_name);
    if (input.agent_company) fd.append("agent_company", input.agent_company);
    if (input.promo_group_id) fd.append("promo_group_id", input.promo_group_id);
    fd.append("email", input.email);
    fd.append("phone", input.phone);
    fd.append("currency", input.currency);
    // fd.append("is_active", input.is_active)
    fd.append("kakao_talk_id", input.kakao_talk_id);
    fd.append("photo_selfie", input.photo_selfie);
    fd.append("photo_id_card", input.photo_id_card);
    if (input.certificate) fd.append("certificate", input.certificate);
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
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-auto">
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
          countryOptions={countryOptions}
          currencyOptions={currencyOptions}
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
