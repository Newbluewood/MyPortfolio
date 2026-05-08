import { z } from "zod";

const cvLinkSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
});

const experienceSchema = z.object({
  company: z.string().min(1),
  period: z.string().optional(),
  roleTitle: z.string().optional(),
  bullets: z.array(z.string()),
});

const educationSchema = z.object({
  institution: z.string().min(1),
  period: z.string().optional(),
  bullets: z.array(z.string()),
});

export const cvDataSchema = z.object({
  name: z.string().min(1),
  headlineApplyingFor: z.string().min(1),
  about: z.string().min(1),
  photo: z.object({
    src: z.string().min(1),
    alt: z.string().min(1),
  }),
  languages: z.array(
    z.object({
      label: z.string().min(1),
      level: z.string().min(1),
    }),
  ),
  contact: z.object({
    email: z.string().min(1),
    linkedIn: cvLinkSchema,
    github: cvLinkSchema,
  }),
  experience: z.array(experienceSchema),
  education: z.array(educationSchema),
  skills: z.array(z.string()),
  portfolioLinks: z.array(cvLinkSchema),
});

export type CvData = z.infer<typeof cvDataSchema>;
