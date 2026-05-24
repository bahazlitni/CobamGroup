import "server-only";

import type { CustomerSession } from "@/lib/customer-auth";

export type CustomerNotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string;
  href: string | null;
  readAt: string | null;
  createdAt: string;
};

export type CustomerNotificationsDto = {
  unreadCount: number;
  items: CustomerNotificationItem[];
};

async function getPrisma() {
  const { prisma } = await import("@cobam/db");
  return prisma;
}

function parseNotificationIds(ids: unknown) {
  if (!Array.isArray(ids)) {
    return [] as bigint[];
  }

  return ids.flatMap((id) => {
    try {
      const parsed = BigInt(String(id));
      return parsed > BigInt(0) ? [parsed] : [];
    } catch {
      return [];
    }
  });
}

export async function listCustomerNotifications(
  session: CustomerSession,
  options: { take?: number } = {},
): Promise<CustomerNotificationsDto> {
  const db = await getPrisma();
  const customerId = BigInt(session.customerId);
  const take = Math.min(Math.max(options.take ?? 10, 1), 50);

  const [items, unreadCount] = await Promise.all([
    db.customerNotification.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
      take,
      select: {
        id: true,
        type: true,
        title: true,
        body: true,
        href: true,
        readAt: true,
        createdAt: true,
      },
    }),
    db.customerNotification.count({
      where: { customerId, readAt: null },
    }),
  ]);

  return {
    unreadCount,
    items: items.map((item) => ({
      id: item.id.toString(),
      type: item.type,
      title: item.title,
      body: item.body,
      href: item.href,
      readAt: item.readAt?.toISOString() ?? null,
      createdAt: item.createdAt.toISOString(),
    })),
  };
}

export async function markCustomerNotificationsRead(
  session: CustomerSession,
  input: { all?: boolean; ids?: unknown },
) {
  const db = await getPrisma();
  const customerId = BigInt(session.customerId);
  const now = new Date();

  if (input.all) {
    const unread = await db.customerNotification.findMany({
      where: { customerId, readAt: null },
      select: { id: true },
    });

    if (unread.length === 0) {
      return [];
    }

    await db.customerNotification.updateMany({
      where: { customerId, readAt: null },
      data: { readAt: now },
    });

    return unread.map((item) => item.id.toString());
  }

  const ids = parseNotificationIds(input.ids);

  if (ids.length === 0) {
    return [];
  }

  const unread = await db.customerNotification.findMany({
    where: {
      customerId,
      id: { in: ids },
      readAt: null,
    },
    select: { id: true },
  });

  if (unread.length === 0) {
    return [];
  }

  const unreadIds = unread.map((item) => item.id);

  await db.customerNotification.updateMany({
    where: {
      customerId,
      id: { in: unreadIds },
      readAt: null,
    },
    data: { readAt: now },
  });

  return unreadIds.map((id) => id.toString());
}

export async function markCustomerNotificationsUnread(
  session: CustomerSession,
  input: { ids?: unknown },
) {
  const db = await getPrisma();
  const customerId = BigInt(session.customerId);
  const ids = parseNotificationIds(input.ids);

  if (ids.length === 0) {
    return [];
  }

  await db.customerNotification.updateMany({
    where: {
      customerId,
      id: { in: ids },
    },
    data: { readAt: null },
  });

  return ids.map((id) => id.toString());
}
