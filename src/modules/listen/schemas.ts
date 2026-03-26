import { z } from "zod";

export const queueSongSchema = z.object({
  url: z.string().trim().url()
});

export const playbackActionSchema = z
  .object({
    action: z.enum(["play", "pause", "skip", "advance-if-current"]),
    expectedQueueItemId: z.string().uuid().optional(),
    positionSeconds: z.coerce.number().min(0).optional()
  })
  .superRefine((value, context) => {
    if (value.action === "advance-if-current" && !value.expectedQueueItemId) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "expectedQueueItemId is required for guarded advance",
        path: ["expectedQueueItemId"]
      });
    }
  });

export const heartbeatSchema = z.object({
  currentQueueItemId: z.string().uuid().optional(),
  titleSnapshot: z.string().trim().min(1).max(200).optional()
});
