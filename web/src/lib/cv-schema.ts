import { z } from "zod";

const cvLinkSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
});

const cvPortfolioLinkSchema = cvLinkSchema.extend({
  description: z.string().optional(),
  descriptionSr: z.string().optional(),
});

const experienceSchema = z.object({
  company: z.string().min(1),
  period: z.string().optional(),
  roleTitle: z.string().optional(),
  roleTitleSr: z.string().optional(),
  bullets: z.array(z.string()),
  bulletsSr: z.array(z.string()).optional(),
});

const educationSchema = z.object({
  institution: z.string().min(1),
  period: z.string().optional(),
  bullets: z.array(z.string()),
  bulletsSr: z.array(z.string()).optional(),
});

export const credentialKindSchema = z.enum([
  "diploma",
  "certificate",
  "letter",
]);

export const credentialSchema = z.object({
  kind: credentialKindSchema,
  title: z.string().min(1),
  titleSr: z.string().optional(),
  period: z.string().optional(),
  /** Path under `web/public`, e.g. `/credentials/ukisai-bootcamp.jpg` */
  file: z.string().min(1),
});

export const cvDataSchema = z.object({
  name: z.string().min(1),
  headlineApplyingFor: z.string().min(1),
  about: z.string().min(1),
  aboutSr: z.string().optional(),
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
    location: z.string().optional(),
    locationSr: z.string().optional(),
    linkedIn: cvLinkSchema,
    github: cvLinkSchema,
  }),
  experience: z.array(experienceSchema),
  education: z.array(educationSchema),
  credentials: z.array(credentialSchema).default([]),
  skills: z.array(z.string()),
  portfolioLinks: z.array(cvPortfolioLinkSchema),
});

export type CvData = z.infer<typeof cvDataSchema>;
export type CvCredential = z.infer<typeof credentialSchema>;
export type CvCredentialKind = z.infer<typeof credentialKindSchema>;
