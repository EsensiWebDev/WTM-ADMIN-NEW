"use client";

import { editAgent } from "@/app/(dashboard)/account/agent-overview/agent-management/actions";
import { Agent } from "@/app/(dashboard)/account/agent-overview/agent-management/types";
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
} from "@/components/ui/dialog";
import { formatUrl } from "@/lib/format";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { useRouter } from "next/navigation";
import { AgentForm } from "../form/agent-form";
import { Option } from "@/types/data-table";
import { getCurrencyOptions } from "@/app/(dashboard)/currency/fetch";

export const editAgentSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  username: z.string().min(1, "Username is required"),
  agent_company: z.string().optional(),
  promo_group_id: z.string().min(1, "Promo group is required"),
  email: z.string().email("Invalid email format").min(1, "Email is required"),
  phone: z
    .string()
    .min(8, "Phone number must be at least 8 characters")
    .max(15, "Phone number must be at most 15 characters"),
  currency: z.string().min(1, "Currency is required"),
  is_active: z.boolean(),
  kakao_talk_id: z.string().min(1, "KakaoTalk ID is required").max(25),
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
  countryOptions?: Option[];
  onAgentUpdate?: (updatedAgent: Agent) => void;
}

const EditAgentDialog = ({
  agent,
  promoGroupSelect,
  countryOptions = [],
  onAgentUpdate,
  ...props
}: EditAgentDialogProps) => {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [currencyOptions, setCurrencyOptions] = React.useState<Option[]>([]);
  const currencyFetchRef = React.useRef(false);
  const formInitializedRef = React.useRef<string | null>(null);

  // Fetch currency options once when dialog opens (cache across open/close cycles)
  React.useEffect(() => {
    if (props.open && !currencyFetchRef.current) {
      currencyFetchRef.current = true;
      getCurrencyOptions().then((options) => {
        setCurrencyOptions(options);
      });
    }
  }, [props.open]);

  const form = useForm<EditAgentSchema>({
    resolver: zodResolver(editAgentSchema),
    defaultValues: {
      full_name: agent?.name || "",
      username: agent?.username || "",
      agent_company: agent?.agent_company_name,
      promo_group_id: String(agent?.promo_group_id) || "0",
      email: agent?.email,
      phone: agent?.phone_number,
      currency: agent?.currency || "IDR",
      is_active: agent?.status === "Active" ? true : false,
      kakao_talk_id: agent?.kakao_talk_id,
      photo_selfie: undefined,
      photo_id_card: undefined,
      certificate: undefined,
      name_card: undefined,
    },
  });

  // Reset form when dialog opens with agent data (ensures fresh data after refresh)
  // Use a unique key combining dialog state and agent ID to prevent duplicate initialization
  React.useEffect(() => {
    if (!props.open || !agent) {
      // Reset initialization flag when dialog closes
      if (!props.open) {
        formInitializedRef.current = null;
      }
      return;
    }

    // Create a unique key for this agent + dialog state combination
    const initializationKey = `${agent.id}-${props.open}`;
    
    // Skip if we've already initialized for this exact combination
    if (formInitializedRef.current === initializationKey) {
      return;
    }

    // Mark as initialized immediately to prevent duplicate runs (even in StrictMode)
    formInitializedRef.current = initializationKey;

    const formValues = {
      full_name: agent.name || "",
      username: agent.username || "",
      agent_company: agent.agent_company_name,
      promo_group_id: String(agent.promo_group_id) || "0",
      email: agent.email,
      phone: agent.phone_number,
      currency: agent.currency || "IDR",
      is_active: agent.status === "Active" ? true : false,
      kakao_talk_id: agent.kakao_talk_id,
      photo_selfie: undefined,
      photo_id_card: undefined,
      certificate: undefined,
      name_card: undefined,
    };

    form.reset(formValues);
    // Explicitly set currency value to ensure Select component updates
    const currencyValue = agent.currency || "IDR";
    form.setValue("currency", currencyValue, { shouldDirty: false });
  }, [props.open, agent?.id, form]);

  function onSubmit(input: EditAgentSchema) {
    startTransition(async () => {
      if (!agent) return;

      // Create FormData for multipart upload
      const fd = new FormData();
      fd.append("user_id", String(agent.id));
      fd.append("role", "agent");

      // Only add fields that have values
      fd.append("full_name", input.full_name);
      fd.append("username", input.username);
      fd.append("agent_company", input.agent_company || "");
      fd.append("promo_group_id", input.promo_group_id);
      fd.append("email", input.email);
      fd.append("phone", input.phone);
      fd.append("currency", input.currency);
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
      
      // Update agent optimistically with the new values
      if (agent && onAgentUpdate) {
        const updatedAgent: Agent = {
          ...agent,
          name: input.full_name,
          username: input.username,
          agent_company_name: input.agent_company || "",
          promo_group_id: Number(input.promo_group_id),
          email: input.email,
          phone_number: input.phone,
          currency: input.currency,
          status: input.is_active ? "Active" : "Inactive",
          kakao_talk_id: input.kakao_talk_id,
        };
        
        onAgentUpdate(updatedAgent);
      }
      
      form.reset(input);
      props.onOpenChange?.(false);
      toast.success(message || "Agent edited");
      router.refresh();
    });
  }

  return (
    <Dialog {...props}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-auto">
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
          countryOptions={countryOptions}
          currencyOptions={currencyOptions}
          existingImages={{
            photo_selfie: formatUrl(agent?.photo),
            photo_id_card: formatUrl(agent?.id_card),
            certificate: formatUrl(agent?.certificate),
            name_card: formatUrl(agent?.name_card),
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
