import "server-only";

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export type ThreadOwner = { userId: string | null; anonId: string | null };

/** Provider-neutral conversation turn. `model` = the assistant. */
export type ChatTurn = { role: "user" | "model"; text: string };

const HISTORY_LIMIT = 20;

function ownerWhere(owner: ThreadOwner): Prisma.ChatThreadWhereInput {
  if (owner.userId) return { userId: owner.userId };
  if (owner.anonId) return { anonId: owner.anonId };
  return { id: "__none__" };
}

export type LoadedThread = {
  threadId: string | null;
  history: ChatTurn[];
};

/**
 * Load an existing thread (only if it belongs to this owner) or signal that a new
 * one should be created. Never throws — a DB outage yields an empty history.
 */
export async function loadThread(
  threadId: string | undefined,
  owner: ThreadOwner,
): Promise<LoadedThread> {
  if (!owner.userId && !owner.anonId) {
    return { threadId: null, history: [] };
  }

  try {
    const thread = threadId
      ? await prisma.chatThread.findFirst({
          where: { id: threadId, ...ownerWhere(owner) },
          include: {
            messages: {
              orderBy: { createdAt: "desc" },
              take: HISTORY_LIMIT,
            },
          },
        })
      : null;

    if (!thread) {
      return { threadId: null, history: [] };
    }

    const history: ChatTurn[] = thread.messages.reverse().map((message) => ({
      role: message.role === "ASSISTANT" ? "model" : "user",
      text: message.content,
    }));

    return { threadId: thread.id, history };
  } catch {
    return { threadId: null, history: [] };
  }
}

export async function listThreadMessages(
  threadId: string | undefined,
  owner: ThreadOwner,
) {
  if (!threadId || (!owner.userId && !owner.anonId)) return [];
  try {
    const thread = await prisma.chatThread.findFirst({
      where: { id: threadId, ...ownerWhere(owner) },
      include: {
        messages: { orderBy: { createdAt: "asc" }, take: 100 },
      },
    });
    if (!thread) return [];
    return thread.messages.map((message) => ({
      role: message.role === "ASSISTANT" ? "assistant" : "user",
      content: message.content,
    }));
  } catch {
    return [];
  }
}

/**
 * Persist one completed turn. Creates the thread on first use. Returns the thread
 * id so the client can keep using it. Never throws.
 */
export async function saveTurn(input: {
  threadId: string | null;
  owner: ThreadOwner;
  userText: string;
  assistantText: string;
  toolTrace: { name: string; input: unknown }[];
}): Promise<string | null> {
  const { threadId, owner } = input;
  if (!owner.userId && !owner.anonId) return null;

  try {
    const thread =
      (threadId
        ? await prisma.chatThread.findFirst({
            where: { id: threadId, ...ownerWhere(owner) },
            select: { id: true },
          })
        : null) ??
      (await prisma.chatThread.create({
        data: {
          userId: owner.userId,
          anonId: owner.userId ? null : owner.anonId,
          title: input.userText.slice(0, 80),
        },
        select: { id: true },
      }));

    await prisma.$transaction([
      prisma.chatMessage.create({
        data: { threadId: thread.id, role: "USER", content: input.userText },
      }),
      prisma.chatMessage.create({
        data: {
          threadId: thread.id,
          role: "ASSISTANT",
          content: input.assistantText,
          toolTrace: input.toolTrace.length
            ? (input.toolTrace as unknown as Prisma.InputJsonValue)
            : undefined,
        },
      }),
      prisma.chatThread.update({
        where: { id: thread.id },
        data: { updatedAt: new Date() },
      }),
    ]);

    return thread.id;
  } catch {
    return null;
  }
}
