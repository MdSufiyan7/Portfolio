
const { z } = require("zod");

const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid project slug");

function isValidHttpUrl(value) {
  if (value === "") return true;

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

const urlSchema = z
  .string()
  .trim()
  .max(2048)
  .refine(isValidHttpUrl, "Enter a valid HTTP or HTTPS URL");

const titleSchema = z.string().trim().min(1).max(120);
const descriptionSchema = z.string().trim().min(1).max(5000);

const technologiesSchema = z
  .array(z.string().trim().min(1).max(40))
  .max(30);

const sortOrderSchema = z.number().int().min(0).max(10000);

const projectCreateSchema = z
  .object({
    title: titleSchema,
    slug: slugSchema.optional(),
    description: descriptionSchema,
    technologies: technologiesSchema.default([]),
    imageUrl: urlSchema.default(""),
    githubUrl: urlSchema.default(""),
    liveUrl: urlSchema.default(""),
    featured: z.boolean().default(false),
    status: z.enum(["draft", "published"]).default("draft"),
    sortOrder: sortOrderSchema.default(0),
  })
  .strict();

const projectUpdateSchema = z
  .object({
    title: titleSchema.optional(),
    slug: slugSchema.optional(),
    description: descriptionSchema.optional(),
    technologies: technologiesSchema.optional(),
    imageUrl: urlSchema.optional(),
    githubUrl: urlSchema.optional(),
    liveUrl: urlSchema.optional(),
    featured: z.boolean().optional(),
    status: z.enum(["draft", "published"]).optional(),
    sortOrder: sortOrderSchema.optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

module.exports = {
  projectCreateSchema,
  projectUpdateSchema,
};
