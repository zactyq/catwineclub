"use server";

import { redirect } from "next/navigation";
import { createApplication } from "@/lib/data/applications";

export async function submitApplication(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const howHeard = String(formData.get("howHeard") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !email) {
    throw new Error("Name and email are required.");
  }

  await createApplication({
    name,
    email,
    phone: phone || undefined,
    howHeard: howHeard || undefined,
    message: message || undefined,
  });

  redirect("/apply/success");
}
