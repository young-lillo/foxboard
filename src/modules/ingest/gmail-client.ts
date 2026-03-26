import { google } from "googleapis";

import { env } from "@/lib/env";
import { GmailMessage } from "@/modules/ingest/types";

export async function listCandidateMessages() {
  const auth = new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET
  );
  auth.setCredentials({ refresh_token: env.GOOGLE_REFRESH_TOKEN });
  await auth.getAccessToken();
  const gmail = google.gmail({ version: "v1", auth });
  const list = await gmail.users.messages.list({
    userId: env.GMAIL_USER,
    q: env.GMAIL_QUERY,
    maxResults: 1
  });
  const latestMessage = list.data.messages?.[0];

  if (!latestMessage?.id) {
    return [];
  }

  const detail = await gmail.users.messages.get({
    userId: env.GMAIL_USER,
    id: latestMessage.id,
    format: "full"
  });

  const payload = detail.data.payload;
  const body =
    payload?.parts?.map((part) => decodeBody(part.body?.data)).join("\n") ??
    decodeBody(payload?.body?.data);

  return [
    {
      id: detail.data.id!,
      threadId: detail.data.threadId!,
      internalDate: Number(detail.data.internalDate ?? Date.now()),
      body
    }
  ];
}

function decodeBody(value?: string | null) {
  if (!value) {
    return "";
  }

  return Buffer.from(value, "base64url").toString("utf8");
}
