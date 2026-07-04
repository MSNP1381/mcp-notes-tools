import { z } from 'zod';

export const searchNotesInputShape = {
	query: z.string().trim().min(1),
	limit: z.number().int().min(1).max(50).default(10),
};

export const getNoteInputShape = {
	path: z.string().trim().min(1),
	title: z.string().trim().optional(),
};

export const appendChangeNoteInputShape = {
	path: z.string().trim().min(1),
	title: z.string().trim().optional(),
	text: z.string().trim().min(1),
};

export const searchNotesInputSchema = z.object(searchNotesInputShape);
export const getNoteInputSchema = z.object(getNoteInputShape);
export const appendChangeNoteInputSchema = z.object(appendChangeNoteInputShape);

export type SearchNotesInput = z.infer<typeof searchNotesInputSchema>;
export type GetNoteInput = z.infer<typeof getNoteInputSchema>;
export type AppendChangeNoteInput = z.infer<typeof appendChangeNoteInputSchema>;
