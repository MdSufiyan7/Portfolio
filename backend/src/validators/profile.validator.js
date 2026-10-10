
const { z } = require("zod");

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
  .refine(
    isValidHttpUrl,
    "Enter a valid HTTP or HTTPS URL"
  );

const profileFields = {
  name: z.string().trim().min(1).max(120),
  role: z.string().trim().min(1).max(120),

  email: z.string().trim().max(254).refine(
    (value) =>
      !value || z.email().safeParse(value).success,
    "Enter a valid email address"
  ),

  location: z.string().trim().max(120),
  heroIntro: z.string().trim().max(1200),
  aboutLead: z.string().trim().max(1200),
  aboutBody: z.string().trim().max(5000),
  experience: z.string().trim().max(5000),

  resumeUrl: optionalUrl,
  githubUrl: optionalUrl,
  linkedinUrl: optionalUrl,
};

const profileUpdateSchema = z
  .object(
    Object.fromEntries(
      Object.entries(profileFields).map(
        ([key, schema]) => [key, schema.optional()]
      )
    )
  )
  .strict()
  .refine(
    (value) => Object.keys(value).length > 0,
    {
      message: "At least one profile field must be provided",
    }
  );

module.exports = { profileUpdateSchema };
