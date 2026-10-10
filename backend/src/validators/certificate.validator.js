
const { z } = require("zod");

const optionalDate = z
  .string()
  .trim()
  .refine(
    (value) => {
      if (!value) return true;

      if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return false;
      }

      const date = new Date(`${value}T00:00:00.000Z`);

      return (
        !Number.isNaN(date.getTime()) &&
        date.toISOString().slice(0, 10) === value
      );
    },
    "Enter a valid date in YYYY-MM-DD format"
  )
  .default("");

function isValidHttpUrl(value) {
  if (!value) return true;

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

const optionalUrl = z
  .string()
  .trim()
  .max(2048)
  .refine(isValidHttpUrl, "Enter a valid HTTP or HTTPS URL")
  .default("");

const certificateFields = {
  title: z.string().trim().min(1).max(180),
  issuer: z.string().trim().min(1).max(120),
  description: z.string().trim().max(3000).default(""),
  issueDate: optionalDate,
  expiryDate: optionalDate,
  credentialId: z.string().trim().max(120).default(""),
  credentialUrl: optionalUrl,
  mediaUrl: optionalUrl,
  status: z.enum(["draft", "published"]).default("draft"),
  sortOrder: z.number().int().min(0).max(10000).default(0),
};

const certificateCreateSchema = z
  .object(certificateFields)
  .strict();

const certificateUpdateSchema = z
  .object({
    title: certificateFields.title.optional(),
    issuer: certificateFields.issuer.optional(),
    description: certificateFields.description.optional(),
    issueDate: certificateFields.issueDate.optional(),
    expiryDate: certificateFields.expiryDate.optional(),
    credentialId: certificateFields.credentialId.optional(),
    credentialUrl: certificateFields.credentialUrl.optional(),
    mediaUrl: certificateFields.mediaUrl.optional(),
    status: certificateFields.status.optional(),
    sortOrder: certificateFields.sortOrder.optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided",
  });

module.exports = {
  certificateCreateSchema,
  certificateUpdateSchema,
};
