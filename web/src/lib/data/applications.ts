import "server-only";
import {
  TABLES,
  createRecord,
  listRecords,
  updateRecord,
  whereEq,
} from "@/lib/nocodb";

export type ApplicationStatus = "pending" | "approved" | "rejected";

export type MembershipApplication = {
  Id: number;
  CreatedAt: string;
  Name: string;
  Email: string;
  Phone: string | null;
  HowHeard: string | null;
  Message: string | null;
  Status: ApplicationStatus;
  ReviewedByEmail: string | null;
  ReviewedAt: string | null;
};

export type NewApplicationInput = {
  name: string;
  email: string;
  phone?: string;
  howHeard?: string;
  message?: string;
};

export async function listApplications(
  status?: ApplicationStatus
): Promise<MembershipApplication[]> {
  return listRecords<MembershipApplication>(TABLES.membershipApplications, {
    where: status ? whereEq("Status", status) : undefined,
    sort: "-CreatedAt",
  });
}

export async function createApplication(
  input: NewApplicationInput
): Promise<MembershipApplication> {
  return createRecord<MembershipApplication>(TABLES.membershipApplications, {
    Name: input.name,
    Email: input.email,
    Phone: input.phone ?? null,
    HowHeard: input.howHeard ?? null,
    Message: input.message ?? null,
    Status: "pending",
    ReviewedByEmail: null,
    ReviewedAt: null,
  });
}

export async function reviewApplication(
  id: number,
  status: "approved" | "rejected",
  reviewerEmail: string
): Promise<void> {
  await updateRecord(TABLES.membershipApplications, id, {
    Status: status,
    ReviewedByEmail: reviewerEmail,
    ReviewedAt: new Date().toISOString(),
  });
}

/** A member is "approved" once any of their applications has been approved. */
export async function isApprovedMember(email: string): Promise<boolean> {
  const approved = await listRecords<MembershipApplication>(
    TABLES.membershipApplications,
    { where: `(Email,eq,${email})~and(Status,eq,approved)`, limit: 1 }
  );
  return approved.length > 0;
}
