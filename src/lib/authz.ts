import { getRole } from "@/lib/roles";

export class ForbiddenError extends Error {
  constructor(message = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}

/** Throws ForbiddenError unless the current request resolves to the owner role. */
export async function requireOwner(): Promise<void> {
  const role = await getRole();
  if (role !== "owner") {
    throw new ForbiddenError("Only the owner can perform this action");
  }
}
