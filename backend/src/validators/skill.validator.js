
const { z } = require("zod");

const skillFields = {
  name: z.string().trim().min(1).max(80),
  category: z.string().trim().min(1).max(80),

  description: z.string().trim().max(500),
  proficiency: z.number().int().min(0).max(100),
  status: z.enum(["draft", "published"]),
  sortOrder: z.number().int().min(0).max(10000),
};

const skillCreateSchema = z
  .object({
    name: skillFields.name,
    category: skillFields.category,
    description: skillFields.description.default(""),
    proficiency: skillFields.proficiency.default(0),
    status: skillFields.status.default("published"),
    sortOrder: skillFields.sortOrder.default(0),
  })
  .strict();

const skillUpdateSchema = z
  .object({
    name: skillFields.name.optional(),
    category: skillFields.category.optional(),
    description: skillFields.description.optional(),
    proficiency: skillFields.proficiency.optional(),
    status: skillFields.status.optional(),
    sortOrder: skillFields.sortOrder.optional(),
  })
  .strict()
  .refine(
    (value) => Object.keys(value).length > 0,
    {
      message: "At least one skill field must be provided",
    }
  );

module.exports = {
  skillCreateSchema,
  skillUpdateSchema,
};
