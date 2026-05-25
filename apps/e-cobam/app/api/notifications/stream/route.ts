import type { Notification as PgNotification } from "pg";
import { createPostgresListenerClient } from "@cobam/db";
import { getCustomerSession } from "@/lib/customer-auth";
import { listCustomerNotifications } from "@/lib/customer-notifications";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CHANNEL = "customer_notifications_changed";

function parseTake(req: Request) {
  const url = new URL(req.url);
  const parsed = Number(url.searchParams.get("take"));

  if (!Number.isInteger(parsed)) {
    return 10;
  }

  return Math.min(Math.max(parsed, 1), 50);
}

function sseMessage(event: string, data: unknown) {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

function normalizeNotificationDate(value: unknown) {
  if (value == null) {
    return null;
  }

  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function normalizePayload(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const record = payload as Record<string, unknown>;
  const notification =
    record.notification && typeof record.notification === "object"
      ? (record.notification as Record<string, unknown>)
      : null;

  if (!notification) {
    return null;
  }

  return {
    operation: String(record.operation ?? "UPDATE"),
    customerId: String(record.customerId ?? ""),
    notification: {
      id: String(notification.id ?? ""),
      type: String(notification.type ?? ""),
      title: String(notification.title ?? ""),
      body: String(notification.body ?? ""),
      href: notification.href == null ? null : String(notification.href),
      readAt: normalizeNotificationDate(notification.readAt),
      createdAt: normalizeNotificationDate(notification.createdAt) ?? new Date().toISOString(),
    },
    oldReadAt: normalizeNotificationDate(record.oldReadAt),
  };
}

export async function GET(req: Request) {
  const session = await getCustomerSession();

  if (!session) {
    return new Response("Connexion requise.", { status: 401 });
  }

  const customerId = String(session.customerId);
  const take = parseTake(req);
  const encoder = new TextEncoder();
  const client = createPostgresListenerClient(`e-cobam-notifications-${customerId}`);
  let isClosed = false;
  let keepAlive: ReturnType<typeof setInterval> | null = null;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        if (isClosed) {
          return;
        }

        try {
          controller.enqueue(encoder.encode(sseMessage(event, data)));
        } catch {
          isClosed = true;
        }
      };

      try {
        send("snapshot", await listCustomerNotifications(session, { take }));

        client.on("notification", (message: PgNotification) => {
          if (message.channel !== CHANNEL || !message.payload) {
            return;
          }

          let payload: ReturnType<typeof normalizePayload>;

          try {
            payload = normalizePayload(JSON.parse(message.payload) as unknown);
          } catch {
            return;
          }

          if (!payload || payload.customerId !== customerId || !payload.notification.id) {
            return;
          }

          send("change", payload);
        });

        client.on("error", (error: Error) => {
          send("stream-error", { message: "notifications-stream-lost" });

          if (!isClosed) {
            isClosed = true;

            if (keepAlive) {
              clearInterval(keepAlive);
              keepAlive = null;
            }

            void client.end().catch(() => {
              // The connection may already be closed.
            });

            controller.error(error);
          }
        });

        await client.connect();
        await client.query(`LISTEN ${CHANNEL}`);

        keepAlive = setInterval(() => {
          send("ping", { now: Date.now() });
        }, 25_000);
      } catch (error) {
        controller.error(error);
      }
    },
    async cancel() {
      isClosed = true;

      if (keepAlive) {
        clearInterval(keepAlive);
      }

      try {
        await client.query(`UNLISTEN ${CHANNEL}`);
      } catch {
        // The connection may already be closed.
      }

      try {
        await client.end();
      } catch {
        // Nothing to clean up.
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Cache-Control": "no-store, no-transform",
      Connection: "keep-alive",
      "Content-Type": "text/event-stream; charset=utf-8",
      "X-Accel-Buffering": "no",
    },
  });
}
