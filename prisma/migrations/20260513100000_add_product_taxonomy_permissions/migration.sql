-- Add dedicated permissions for product taxonomy administration.
WITH permission_rows("key", "label", "resource", "action", "scope", "description") AS (
  VALUES
    ('product_colors.view', 'Can view colors', 'product_colors', 'view', NULL, NULL),
    ('product_colors.manage', 'Can manage colors', 'product_colors', 'manage', NULL, NULL),
    ('product_finishes.view', 'Can view finishes', 'product_finishes', 'view', NULL, NULL),
    ('product_finishes.manage', 'Can manage finishes', 'product_finishes', 'manage', NULL, NULL),
    ('product_templates.view', 'Can view product templates', 'product_templates', 'view', NULL, NULL),
    ('product_templates.manage', 'Can manage Product Templates', 'product_templates', 'manage', NULL, NULL),
    ('product_attributes.view', 'Can view product attributes', 'product_attributes', 'view', NULL, NULL),
    ('product_attributes.manage', 'Can manage Product Attributes', 'product_attributes', 'manage', NULL, NULL)
)
INSERT INTO "permissions" (
  "key",
  "label",
  "resource",
  "action",
  "scope",
  "description",
  "created_at",
  "updated_at"
)
SELECT
  "key",
  "label",
  "resource",
  "action",
  "scope"::TEXT,
  "description"::TEXT,
  NOW(),
  NOW()
FROM permission_rows
ON CONFLICT ("key") DO UPDATE SET
  "label" = EXCLUDED."label",
  "resource" = EXCLUDED."resource",
  "action" = EXCLUDED."action",
  "scope" = EXCLUDED."scope",
  "description" = EXCLUDED."description",
  "updated_at" = NOW();

-- Existing default roles are not re-synced by the RBAC bootstrap once created.
WITH role_permission_grants("role_key", "permission_key") AS (
  VALUES
    ('PRODUCT_MANAGER', 'product_colors.view'),
    ('PRODUCT_MANAGER', 'product_colors.manage'),
    ('PRODUCT_MANAGER', 'product_finishes.view'),
    ('PRODUCT_MANAGER', 'product_finishes.manage'),
    ('PRODUCT_MANAGER', 'product_templates.view'),
    ('PRODUCT_MANAGER', 'product_templates.manage'),
    ('PRODUCT_MANAGER', 'product_attributes.view'),
    ('PRODUCT_MANAGER', 'product_attributes.manage'),
    ('PRODUCT_EDITOR', 'product_colors.view'),
    ('PRODUCT_EDITOR', 'product_finishes.view'),
    ('PRODUCT_EDITOR', 'product_templates.view'),
    ('PRODUCT_EDITOR', 'product_attributes.view')
)
INSERT INTO "role_permissions" ("role_id", "permission_id", "allowed")
SELECT
  roles."id",
  permissions."id",
  TRUE
FROM role_permission_grants
JOIN "roles" ON roles."key" = role_permission_grants."role_key"
JOIN "permissions" ON permissions."key" = role_permission_grants."permission_key"
ON CONFLICT ("role_id", "permission_id") DO UPDATE SET
  "allowed" = EXCLUDED."allowed";
