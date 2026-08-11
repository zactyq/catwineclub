import "server-only";
import { TABLES, createRecord, deleteRecord, listRecords } from "@/lib/nocodb";

export type Admin = {
  Id: number;
  CreatedAt: string;
  Email: string;
  AddedByEmail: string | null;
};

export async function listAdmins(): Promise<Admin[]> {
  return listRecords<Admin>(TABLES.admins, { sort: "-CreatedAt" });
}

export async function isAdminInRoster(email: string): Promise<boolean> {
  const admins = await listAdmins();
  return admins.some((a) => a.Email.toLowerCase() === email.toLowerCase());
}

export async function addAdmin(email: string, addedByEmail: string): Promise<Admin> {
  return createRecord<Admin>(TABLES.admins, {
    Email: email,
    AddedByEmail: addedByEmail,
  });
}

export async function removeAdmin(id: number): Promise<void> {
  await deleteRecord(TABLES.admins, id);
}
