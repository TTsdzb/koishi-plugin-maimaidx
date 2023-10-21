import { z } from "zod";

/**
 * Scheme for parsing music information from Diving-fish API.
 *
 * This is hard to store or query inside a database, and will
 * be converted into other schemes.
 */
export const ApiMusic = z.object({
  id: z.coerce.number().int(),
  title: z.string(),
  type: z.string(),
  ds: z.number().array(),
  level: z.string().array(),
  cids: z.number().int().array(),
  charts: z
    .object({
      notes: z.number().int().array(),
      charter: z.string(),
    })
    .array(),
  basic_info: z.object({
    title: z.string(),
    artist: z.string(),
    genre: z.string(),
    bpm: z.number().int(),
    release_date: z.string(),
    from: z.string(),
    is_new: z.boolean(),
  }),
});

export type ApiMusic = z.infer<typeof ApiMusic>;
