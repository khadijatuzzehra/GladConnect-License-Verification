import crypto from "crypto";

export function hashQuery(query: string) {
  return crypto
    .createHash("sha256")
    .update(query.trim().toLowerCase())
    .digest("hex");
}
