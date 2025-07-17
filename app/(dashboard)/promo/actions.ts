"use server";

import { CreatePromoSchema, EditPromoSchema } from "./types";

export async function updatePromoStatus(promoId: string, status: boolean) {
  console.log("Update Promo Status");
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Simulate success response
  return { success: true, message: `Promo status updated to ${status}` };
}

export async function deletePromo(promoId: string) {
  console.log("Delete Promo");
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Simulate success response
  return { success: true, message: `Promo deleted` };
}

export async function createPromo(input: CreatePromoSchema) {
  console.log("Create Promo:");
  console.log({ input });

  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Simulate success response
  return { success: true, message: `Promo created` };
}

export async function editPromo(input: EditPromoSchema & { id: string }) {
  console.log("Edit Promo:");
  console.log({ input });

  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Simulate success response
  return { success: true, message: `Promo edited` };
}
