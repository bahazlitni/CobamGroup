CREATE OR REPLACE FUNCTION public.notify_customer_notifications_changed()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  payload jsonb;
BEGIN
  IF TG_OP = 'DELETE' THEN
    payload := jsonb_build_object(
      'operation', TG_OP,
      'customerId', OLD.customer_id::text,
      'notification', jsonb_build_object(
        'id', OLD.id::text,
        'type', OLD.type,
        'title', OLD.title,
        'body', OLD.body,
        'href', OLD.href,
        'readAt', OLD.read_at,
        'createdAt', OLD.created_at
      ),
      'oldReadAt', OLD.read_at
    );

    PERFORM pg_notify('customer_notifications_changed', payload::text);
    RETURN OLD;
  END IF;

  payload := jsonb_build_object(
    'operation', TG_OP,
    'customerId', NEW.customer_id::text,
    'notification', jsonb_build_object(
      'id', NEW.id::text,
      'type', NEW.type,
      'title', NEW.title,
      'body', NEW.body,
      'href', NEW.href,
      'readAt', NEW.read_at,
      'createdAt', NEW.created_at
    ),
    'oldReadAt', CASE WHEN TG_OP = 'UPDATE' THEN OLD.read_at ELSE NULL END
  );

  PERFORM pg_notify('customer_notifications_changed', payload::text);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS customer_notifications_changed_notify ON public.customer_notifications;

CREATE TRIGGER customer_notifications_changed_notify
AFTER INSERT OR UPDATE OR DELETE ON public.customer_notifications
FOR EACH ROW
EXECUTE FUNCTION public.notify_customer_notifications_changed();
