"use client";

import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { BadgePercent, CreditCard, ReceiptText, Truck, UsersRound } from "lucide-react";
import Loading from "@/components/staff/Loading";
import Panel from "@/components/staff/ui/Panel";
import PanelInput from "@/components/staff/ui/PanelInput";
import PanelTable from "@/components/staff/ui/PanelTable";
import {
  StaffBadge,
  StaffNotice,
  StaffPageHeader,
  StaffSelect,
  type StaffSelectOption,
} from "@/components/staff/ui";
import { AnimatedUIButton } from "@/components/ui/custom/AnimatedUIButton";
import {
  listEcommerceCustomersAdminClient,
  listEcommerceFulfillmentsAdminClient,
  listEcommerceOrdersAdminClient,
  listEcommercePaymentsAdminClient,
  listEcommercePromotionsAdminClient,
  updateEcommerceFulfillmentStatusAdminClient,
  updateEcommerceOrderStatusAdminClient,
  updateEcommercePaymentStatusAdminClient,
} from "@/features/ecommerce-admin/client";
import type {
  EcommerceCustomersAdminDto,
  EcommerceFulfillmentsAdminDto,
  EcommerceOrdersAdminDto,
  EcommercePaymentsAdminDto,
  EcommercePromotionsAdminDto,
} from "@/features/ecommerce-admin/types";

type Metric = {
  label: string;
  value: string | number;
  hint?: string;
};

const ALL_FILTER_VALUE = "__all__";

const statusLabels: Record<string, string> = {
  ACTIVE: "Active",
  ARCHIVED: "Archivee",
  AUTHORIZED: "Autorise",
  BANNED: "Banni",
  BANK_TRANSFER: "Virement",
  CANCELLED: "Annulée",
  CARD: "Carte",
  CASH_ON_DELIVERY: "Paiement livraison",
  CLOSED: "Ferme",
  COMPANY: "Société",
  CONFIRMED: "Confirmée",
  DELIVERED: "Livrée",
  DELIVERY: "Livraison",
  DRAFT: "Brouillon",
  EXPIRED: "Expirée",
  FAILED: "Echouée",
  FIXED_AMOUNT: "Montant fixe",
  FREE_SHIPPING: "Livraison offerte",
  INDIVIDUAL: "Particulier",
  IN_TRANSIT: "En transit",
  PAID: "Payée",
  PARTIALLY_REFUNDED: "Partiellement remboursée",
  PAUSED: "En pause",
  PAY_IN_STORE: "Paiement showroom",
  PENDING: "En attente",
  PERCENT: "Pourcentage",
  PICKUP: "Retrait",
  PREPARING: "Préparation",
  READY: "Prêt",
  READY_FOR_PICKUP: "Prêt retrait",
  REFUNDED: "Remboursée",
  SHIPPED: "Expediée",
  SCHEDULED: "Planifiée",
  SUSPENDED: "Suspendu",
};

const statusColors: Record<string, string> = {
  ACTIVE: "#0a8dc1",
  ARCHIVED: "#64748b",
  AUTHORIZED: "#2563eb",
  CANCELLED: "#64748b",
  CONFIRMED: "#0a8dc1",
  DELIVERED: "#16a34a",
  DRAFT: "#94a3b8",
  EXPIRED: "#64748b",
  FAILED: "#dc2626",
  IN_TRANSIT: "#0a8dc1",
  PAID: "#16a34a",
  PARTIALLY_REFUNDED: "#a16207",
  PAUSED: "#d97706",
  PENDING: "#d97706",
  PREPARING: "#2563eb",
  READY: "#2563eb",
  READY_FOR_PICKUP: "#2563eb",
  REFUNDED: "#64748b",
  SCHEDULED: "#2563eb",
  SHIPPED: "#0a8dc1",
};

function statusOption(value: string): StaffSelectOption {
  return { value, label: formatStatus(value) };
}

const orderStatusValues = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY_FOR_PICKUP",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

const paymentStatusValues = [
  "PENDING",
  "AUTHORIZED",
  "PAID",
  "FAILED",
  "CANCELLED",
  "REFUNDED",
  "PARTIALLY_REFUNDED",
];

const fulfillmentStatusValues = [
  "PENDING",
  "SCHEDULED",
  "PREPARING",
  "READY",
  "IN_TRANSIT",
  "DELIVERED",
  "FAILED",
  "CANCELLED",
];

const orderStatusOptions = orderStatusValues.map(statusOption);
const paymentStatusOptions = paymentStatusValues.map(statusOption);
const fulfillmentStatusOptions = fulfillmentStatusValues.map(statusOption);

function formatStatus(value: string | null | undefined) {
  if (!value) return "-";
  return statusLabels[value] ?? value.toLowerCase().replace(/_/g, " ");
}

function statusColor(value: string | null | undefined) {
  return value ? (statusColors[value] ?? "#64748b") : "#64748b";
}

function formatDate(value: string | null | undefined) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatMoney(value: string | null | undefined, currency = "TND") {
  const numberValue = Number(value ?? 0);
  const safeValue = Number.isFinite(numberValue) ? numberValue : 0;

  return new Intl.NumberFormat("fr-TN", {
    style: "currency",
    currency,
    maximumFractionDigits: 3,
  }).format(safeValue);
}

function StatusBadge({ value }: { value: string | null | undefined }) {
  return (
    <StaffBadge color={statusColor(value)} size="sm">
      {formatStatus(value)}
    </StaffBadge>
  );
}

function MetricsGrid({ metrics }: { metrics: Metric[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
        >
          <p className="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
            {metric.label}
          </p>
          <p className="text-cobam-dark-blue mt-2 text-2xl font-semibold">{metric.value}</p>
          {metric.hint ? <p className="mt-1 text-xs text-slate-500">{metric.hint}</p> : null}
        </div>
      ))}
    </div>
  );
}

function normalizeText(value: string | number | null | undefined) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function matchesSearch(fields: Array<string | number | null | undefined>, query: string) {
  const normalizedQuery = normalizeText(query.trim());

  if (!normalizedQuery) {
    return true;
  }

  return fields.some((field) => normalizeText(field).includes(normalizedQuery));
}

function allOption(label = "Tous"): StaffSelectOption {
  return { value: ALL_FILTER_VALUE, label };
}

function statusFilterOptions(values: string[], allLabel = "Tous les statuts") {
  return [allOption(allLabel), ...values.map(statusOption)];
}

function SearchAndFilters({
  search,
  onSearchChange,
  searchPlaceholder,
  resultCount,
  totalCount,
  children,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  resultCount: number;
  totalCount: number;
  children?: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0 flex-1">
          <label className="text-xs font-semibold tracking-[0.16em] text-slate-400 uppercase">
            Recherche
          </label>
          <PanelInput
            fullWidth
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            className="mt-2"
          />
        </div>
        {children ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:flex xl:items-end">{children}</div>
        ) : null}
      </div>
      <p className="mt-3 text-xs font-semibold text-slate-500">
        {resultCount} resultat(s) sur {totalCount}
      </p>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: StaffSelectOption[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="text-xs font-semibold tracking-[0.16em] text-slate-400 uppercase">
        {label}
      </label>
      <StaffSelect
        value={value}
        options={options}
        onValueChange={onChange}
        triggerClassName="mt-2 min-w-44"
      />
    </div>
  );
}

function useAdminData<T>(loader: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      setData(await loader());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chargement impossible.");
    } finally {
      setIsLoading(false);
    }
  }, [loader]);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, isLoading, error, reload: load };
}

function ErrorNotice({ error, onRetry }: { error: string | null; onRetry: () => void }) {
  if (!error) return null;

  return (
    <StaffNotice variant="error" title="Erreur de chargement">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span>{error}</span>
        <AnimatedUIButton
          type="button"
          size="sm"
          variant="outline"
          icon="restart"
          iconPosition="left"
          onClick={onRetry}
        >
          Réessayer
        </AnimatedUIButton>
      </div>
    </StaffNotice>
  );
}

function ActionNotice({ error, message }: { error: string | null; message: string | null }) {
  if (error) {
    return (
      <StaffNotice variant="error" title="Action impossible">
        {error}
      </StaffNotice>
    );
  }

  if (message) {
    return (
      <StaffNotice variant="success" title="Operation effectuee">
        {message}
      </StaffNotice>
    );
  }

  return null;
}

function StatusActionSelect({
  value,
  options,
  disabled,
  onChange,
}: {
  value: string;
  options: StaffSelectOption[];
  disabled: boolean;
  onChange: (status: string) => void;
}) {
  return (
    <StaffSelect
      value={value}
      options={options}
      onValueChange={onChange}
      disabled={disabled}
      triggerClassName="min-w-40"
    />
  );
}

function useManagedAction(reload: () => Promise<void>) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const runAction = useCallback(
    async (id: string, action: () => Promise<void>, successMessage: string) => {
      setPendingId(id);
      setActionError(null);
      setActionMessage(null);

      try {
        await action();
        setActionMessage(successMessage);
        await reload();
      } catch (err) {
        setActionError(err instanceof Error ? err.message : "Action impossible.");
      } finally {
        setPendingId(null);
      }
    },
    [reload],
  );

  return { pendingId, actionError, actionMessage, runAction };
}

function TablePanel({
  title,
  description,
  columns,
  isLoading,
  isEmpty,
  error,
  children,
}: {
  title: string;
  description: string;
  columns: string[];
  isLoading: boolean;
  isEmpty: boolean;
  error: string | null;
  children: ReactNode;
}) {
  return (
    <Panel
      pretitle="E-commerce"
      title={title}
      description={description}
      className="max-w-none"
      allowOverflow
    >
      <div className="overflow-x-auto">
        <PanelTable columns={columns} isLoading={isLoading} isEmpty={isEmpty} error={error}>
          {children}
        </PanelTable>
      </div>
    </Panel>
  );
}

export function EcommerceOrdersAdminPage() {
  const { data, isLoading, error, reload } = useAdminData<EcommerceOrdersAdminDto>(
    listEcommerceOrdersAdminClient,
  );
  const rawItems = data?.items ?? [];
  const [search, setSearch] = useState("");
  const [orderStatus, setOrderStatus] = useState(ALL_FILTER_VALUE);
  const [paymentStatus, setPaymentStatus] = useState(ALL_FILTER_VALUE);
  const [fulfillmentStatus, setFulfillmentStatus] = useState(ALL_FILTER_VALUE);
  const { pendingId, actionError, actionMessage, runAction } = useManagedAction(reload);
  const items = useMemo(
    () =>
      rawItems.filter(
        (order) =>
          matchesSearch(
            [
              order.orderNumber,
              order.customerLabel,
              order.contact,
              order.status,
              order.paymentStatus,
              order.fulfillmentStatus,
              order.latestPaymentMethod,
              order.latestFulfillmentMethod,
              order.totalTtc,
            ],
            search,
          ) &&
          (orderStatus === ALL_FILTER_VALUE || order.status === orderStatus) &&
          (paymentStatus === ALL_FILTER_VALUE || order.paymentStatus === paymentStatus) &&
          (fulfillmentStatus === ALL_FILTER_VALUE || order.fulfillmentStatus === fulfillmentStatus),
      ),
    [fulfillmentStatus, orderStatus, paymentStatus, rawItems, search],
  );

  return (
    <div className="space-y-6">
      <StaffPageHeader
        eyebrow="E-commerce"
        title="Commandes"
        icon={ReceiptText}
        status={<StaffBadge color="#0a8dc1">{data?.stats.total ?? 0} emises</StaffBadge>}
      />

      <ErrorNotice error={error} onRetry={() => void reload()} />
      <ActionNotice error={actionError} message={actionMessage} />
      {isLoading && !data ? <Loading /> : null}

      <MetricsGrid
        metrics={[
          { label: "Commandes emises", value: data?.stats.total ?? 0 },
          { label: "Ce mois", value: data?.stats.placedThisMonth ?? 0 },
          {
            label: "CA commandes",
            value: formatMoney(data?.stats.revenueTtc ?? "0"),
            hint: "Hors brouillons",
          },
          {
            label: "Statuts actifs",
            value: data?.stats.byStatus.length ?? 0,
            hint: data?.stats.byStatus
              .map((item) => `${formatStatus(item.label)} ${item.count}`)
              .join(" | "),
          },
        ]}
      />

      <SearchAndFilters
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Commande, client, email, telephone..."
        resultCount={items.length}
        totalCount={rawItems.length}
      >
        <FilterSelect
          label="Commande"
          value={orderStatus}
          options={statusFilterOptions(orderStatusValues)}
          onChange={setOrderStatus}
        />
        <FilterSelect
          label="Paiement"
          value={paymentStatus}
          options={statusFilterOptions(paymentStatusValues)}
          onChange={setPaymentStatus}
        />
        <FilterSelect
          label="Livraison"
          value={fulfillmentStatus}
          options={statusFilterOptions(fulfillmentStatusValues)}
          onChange={setFulfillmentStatus}
        />
      </SearchAndFilters>

      <PanelTable
        columns={[
          "Commande",
          "Client",
          "Date",
          "Statut",
          "Paiement",
          "Livraison",
          "Articles",
          "Total",
        ]}
        isLoading={isLoading}
        isEmpty={items.length === 0}
        error={error}
      >
        {items.map((order) => (
          <tr key={order.id} className="align-top">
            <td className="text-cobam-dark-blue px-4 py-4 font-semibold">{order.orderNumber}</td>
            <td className="px-4 py-4">
              <p className="font-medium text-slate-800">{order.customerLabel}</p>
              <p className="text-xs text-slate-500">{order.contact ?? "-"}</p>
            </td>
            <td className="px-4 py-4 text-slate-600">{formatDate(order.placedAt)}</td>
            <td className="px-4 py-4">
              <StatusActionSelect
                value={order.status}
                options={orderStatusOptions}
                disabled={pendingId === order.id}
                onChange={(status) => {
                  if (status === order.status) return;

                  void runAction(
                    order.id,
                    () => updateEcommerceOrderStatusAdminClient(order.id, { status }),
                    "Statut de commande mis a jour.",
                  );
                }}
              />
            </td>
            <td className="px-4 py-4">
              <div className="space-y-1">
                <StatusBadge value={order.paymentStatus} />
                <p className="text-xs text-slate-500">{formatStatus(order.latestPaymentMethod)}</p>
              </div>
            </td>
            <td className="px-4 py-4">
              <div className="space-y-1">
                <StatusBadge value={order.fulfillmentStatus} />
                <p className="text-xs text-slate-500">
                  {formatStatus(order.latestFulfillmentMethod)}
                </p>
              </div>
            </td>
            <td className="px-4 py-4 text-slate-600">{order.itemCount}</td>
            <td className="text-cobam-dark-blue px-4 py-4 font-semibold">
              {formatMoney(order.totalTtc, order.currency)}
            </td>
          </tr>
        ))}
      </PanelTable>
    </div>
  );
}

export function EcommerceCustomersAdminPage() {
  const { data, isLoading, error, reload } = useAdminData<EcommerceCustomersAdminDto>(
    listEcommerceCustomersAdminClient,
  );
  const rawItems = data?.items ?? [];
  const [search, setSearch] = useState("");
  const [customerType, setCustomerType] = useState(ALL_FILTER_VALUE);
  const [customerStatus, setCustomerStatus] = useState(ALL_FILTER_VALUE);
  const [orderPresence, setOrderPresence] = useState(ALL_FILTER_VALUE);
  const items = useMemo(
    () =>
      rawItems.filter(
        (customer) =>
          matchesSearch(
            [
              customer.label,
              customer.email,
              customer.phone,
              customer.type,
              customer.status,
              customer.lastOrderNumber,
              customer.totalSpentTtc,
            ],
            search,
          ) &&
          (customerType === ALL_FILTER_VALUE || customer.type === customerType) &&
          (customerStatus === ALL_FILTER_VALUE || customer.status === customerStatus) &&
          (orderPresence === ALL_FILTER_VALUE ||
            (orderPresence === "WITH_ORDERS"
              ? customer.orderCount > 0
              : customer.orderCount === 0)),
      ),
    [customerStatus, customerType, orderPresence, rawItems, search],
  );

  return (
    <div className="space-y-6">
      <StaffPageHeader
        eyebrow="E-commerce"
        title="Comptes clients"
        icon={UsersRound}
        status={<StaffBadge color="#0a8dc1">{data?.stats.total ?? 0} comptes</StaffBadge>}
      />

      <ErrorNotice error={error} onRetry={() => void reload()} />

      <MetricsGrid
        metrics={[
          { label: "Comptes clients", value: data?.stats.total ?? 0 },
          { label: "Societes", value: data?.stats.companies ?? 0 },
          { label: "Particuliers", value: data?.stats.individuals ?? 0 },
          { label: "Avec commandes", value: data?.stats.withOrders ?? 0 },
        ]}
      />

      <SearchAndFilters
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Client, email, telephone, derniere commande..."
        resultCount={items.length}
        totalCount={rawItems.length}
      >
        <FilterSelect
          label="Type"
          value={customerType}
          options={[
            allOption("Tous les types"),
            { value: "INDIVIDUAL", label: formatStatus("INDIVIDUAL") },
            { value: "COMPANY", label: formatStatus("COMPANY") },
          ]}
          onChange={setCustomerType}
        />
        <FilterSelect
          label="Statut"
          value={customerStatus}
          options={[
            allOption("Tous les statuts"),
            ...["ACTIVE", "SUSPENDED", "BANNED", "CLOSED"].map(statusOption),
          ]}
          onChange={setCustomerStatus}
        />
        <FilterSelect
          label="Commandes"
          value={orderPresence}
          options={[
            allOption("Tous les clients"),
            { value: "WITH_ORDERS", label: "Avec commandes" },
            { value: "WITHOUT_ORDERS", label: "Sans commande" },
          ]}
          onChange={setOrderPresence}
        />
      </SearchAndFilters>

      <PanelTable
        columns={[
          "Client",
          "Type",
          "Statut",
          "Commandes",
          "Total achat",
          "Adresses",
          "Paiements",
          "Derniere activite",
        ]}
        isLoading={isLoading}
        isEmpty={items.length === 0}
        error={error}
      >
        {items.map((customer) => (
          <tr key={customer.id} className="align-top">
            <td className="px-4 py-4">
              <p className="text-cobam-dark-blue font-semibold">{customer.label}</p>
              <p className="text-xs text-slate-500">{customer.email}</p>
              <p className="text-xs text-slate-500">{customer.phone ?? "-"}</p>
            </td>
            <td className="px-4 py-4">
              <StaffBadge size="sm" color="#14202e">
                {formatStatus(customer.type)}
              </StaffBadge>
            </td>
            <td className="px-4 py-4">
              <StatusBadge value={customer.status} />
            </td>
            <td className="px-4 py-4">
              <p className="font-semibold text-slate-800">{customer.orderCount}</p>
              <p className="text-xs text-slate-500">
                {customer.lastOrderNumber ?? "Aucune commande"}
              </p>
            </td>
            <td className="text-cobam-dark-blue px-4 py-4 font-semibold">
              {formatMoney(customer.totalSpentTtc)}
            </td>
            <td className="px-4 py-4 text-slate-600">{customer.addressCount}</td>
            <td className="px-4 py-4 text-slate-600">{customer.paymentMethodCount}</td>
            <td className="px-4 py-4 text-slate-600">
              <p>{formatDate(customer.lastLoginAt)}</p>
              <p className="text-xs text-slate-500">Cree le {formatDate(customer.createdAt)}</p>
            </td>
          </tr>
        ))}
      </PanelTable>
    </div>
  );
}

export function EcommercePromotionsAdminPage() {
  const { data, isLoading, error, reload } = useAdminData<EcommercePromotionsAdminDto>(
    listEcommercePromotionsAdminClient,
  );
  const items = data?.items ?? [];

  return (
    <div className="space-y-6">
      <StaffPageHeader
        eyebrow="E-commerce"
        title="Promotions"
        icon={BadgePercent}
        status={<StaffBadge color="#0a8dc1">{data?.stats.active ?? 0} actives</StaffBadge>}
      />

      <ErrorNotice error={error} onRetry={() => void reload()} />

      <MetricsGrid
        metrics={[
          { label: "Promotions", value: data?.stats.total ?? 0 },
          { label: "Actives", value: data?.stats.active ?? 0 },
          { label: "En pause", value: data?.stats.paused ?? 0 },
          { label: "Brouillons", value: data?.stats.draft ?? 0 },
        ]}
      />

      <TablePanel
        title="Regles promotionnelles"
        description="Promotions, coupons et portee commerciale active dans le parcours e-commerce."
        columns={["Promotion", "Statut", "Remise", "Fenetre", "Usage", "Coupons", "Portee"]}
        isLoading={isLoading}
        isEmpty={items.length === 0}
        error={error}
      >
        {items.map((promotion) => (
          <tr key={promotion.id} className="align-top">
            <td className="px-4 py-4">
              <p className="text-cobam-dark-blue font-semibold">{promotion.name}</p>
              <p className="text-xs text-slate-500">
                Minimum{" "}
                {promotion.minimumSubtotalTtc ? formatMoney(promotion.minimumSubtotalTtc) : "-"}
              </p>
            </td>
            <td className="px-4 py-4">
              <StatusBadge value={promotion.status} />
            </td>
            <td className="px-4 py-4">
              <p className="font-medium text-slate-800">
                {promotion.discountType === "PERCENT"
                  ? `${promotion.discountValue}%`
                  : promotion.discountType === "FREE_SHIPPING"
                    ? formatStatus(promotion.discountType)
                    : formatMoney(promotion.discountValue)}
              </p>
              <p className="text-xs text-slate-500">{formatStatus(promotion.discountType)}</p>
            </td>
            <td className="px-4 py-4 text-slate-600">
              <p>{formatDate(promotion.startsAt)}</p>
              <p className="text-xs text-slate-500">au {formatDate(promotion.endsAt)}</p>
            </td>
            <td className="px-4 py-4 text-slate-600">
              {promotion.usageCount} / {promotion.usageLimit ?? "illimité"}
            </td>
            <td className="px-4 py-4 text-slate-600">{promotion.couponCount}</td>
            <td className="px-4 py-4 text-slate-600">
              {promotion.productScopeCount} produits, {promotion.categoryScopeCount} categories,{" "}
              {promotion.brandScopeCount} marques
            </td>
          </tr>
        ))}
      </TablePanel>
    </div>
  );
}

export function EcommercePaymentsAdminPage() {
  const { data, isLoading, error, reload } = useAdminData<EcommercePaymentsAdminDto>(
    listEcommercePaymentsAdminClient,
  );
  const rawItems = data?.items ?? [];
  const [search, setSearch] = useState("");
  const [paymentStatus, setPaymentStatus] = useState(ALL_FILTER_VALUE);
  const [paymentMethod, setPaymentMethod] = useState(ALL_FILTER_VALUE);
  const { pendingId, actionError, actionMessage, runAction } = useManagedAction(reload);
  const items = useMemo(
    () =>
      rawItems.filter(
        (payment) =>
          matchesSearch(
            [
              payment.orderNumber,
              payment.customerLabel,
              payment.provider,
              payment.method,
              payment.status,
              payment.amount,
              payment.transactionReference,
            ],
            search,
          ) &&
          (paymentStatus === ALL_FILTER_VALUE || payment.status === paymentStatus) &&
          (paymentMethod === ALL_FILTER_VALUE || payment.method === paymentMethod),
      ),
    [paymentMethod, paymentStatus, rawItems, search],
  );

  return (
    <div className="space-y-6">
      <StaffPageHeader
        eyebrow="E-commerce"
        title="Paiements"
        icon={CreditCard}
        status={<StaffBadge color="#0a8dc1">{data?.stats.total ?? 0} paiements</StaffBadge>}
      />

      <ErrorNotice error={error} onRetry={() => void reload()} />
      <ActionNotice error={actionError} message={actionMessage} />

      <MetricsGrid
        metrics={[
          { label: "Paiements", value: data?.stats.total ?? 0 },
          { label: "Payes", value: data?.stats.paid ?? 0 },
          { label: "En attente", value: data?.stats.pending ?? 0 },
          {
            label: "Encaisse",
            value: formatMoney(data?.stats.collectedTtc ?? "0"),
            hint: `${data?.stats.failed ?? 0} echoues`,
          },
        ]}
      />

      <SearchAndFilters
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Commande, client, prestataire, reference..."
        resultCount={items.length}
        totalCount={rawItems.length}
      >
        <FilterSelect
          label="Statut"
          value={paymentStatus}
          options={statusFilterOptions(paymentStatusValues)}
          onChange={setPaymentStatus}
        />
        <FilterSelect
          label="Methode"
          value={paymentMethod}
          options={[
            allOption("Toutes les methodes"),
            ...["CARD", "BANK_TRANSFER", "CASH_ON_DELIVERY", "PAY_IN_STORE"].map(statusOption),
          ]}
          onChange={setPaymentMethod}
        />
      </SearchAndFilters>

      <PanelTable
        columns={[
          "Commande",
          "Client",
          "Prestataire",
          "Methode",
          "Statut",
          "Montant",
          "Reference",
          "Date",
        ]}
        isLoading={isLoading}
        isEmpty={items.length === 0}
        error={error}
      >
        {items.map((payment) => (
          <tr key={payment.id} className="align-top">
            <td className="text-cobam-dark-blue px-4 py-4 font-semibold">{payment.orderNumber}</td>
            <td className="px-4 py-4 text-slate-600">{payment.customerLabel}</td>
            <td className="px-4 py-4 text-slate-600">{payment.provider}</td>
            <td className="px-4 py-4 text-slate-600">{formatStatus(payment.method)}</td>
            <td className="px-4 py-4">
              <StatusActionSelect
                value={payment.status}
                options={paymentStatusOptions}
                disabled={pendingId === payment.id}
                onChange={(status) => {
                  if (status === payment.status) return;

                  void runAction(
                    payment.id,
                    () => updateEcommercePaymentStatusAdminClient(payment.id, { status }),
                    "Statut de paiement mis a jour.",
                  );
                }}
              />
            </td>
            <td className="text-cobam-dark-blue px-4 py-4 font-semibold">
              {formatMoney(payment.amount, payment.currency)}
            </td>
            <td className="px-4 py-4 text-slate-600">{payment.transactionReference ?? "-"}</td>
            <td className="px-4 py-4 text-slate-600">{formatDate(payment.createdAt)}</td>
          </tr>
        ))}
      </PanelTable>
    </div>
  );
}

export function EcommerceFulfillmentsAdminPage() {
  const { data, isLoading, error, reload } = useAdminData<EcommerceFulfillmentsAdminDto>(
    listEcommerceFulfillmentsAdminClient,
  );
  const rawItems = data?.items ?? [];
  const [search, setSearch] = useState("");
  const [fulfillmentStatus, setFulfillmentStatus] = useState(ALL_FILTER_VALUE);
  const [fulfillmentMethod, setFulfillmentMethod] = useState(ALL_FILTER_VALUE);
  const { pendingId, actionError, actionMessage, runAction } = useManagedAction(reload);
  const items = useMemo(
    () =>
      rawItems.filter(
        (fulfillment) =>
          matchesSearch(
            [
              fulfillment.orderNumber,
              fulfillment.customerLabel,
              fulfillment.method,
              fulfillment.status,
              fulfillment.pickupLocation,
              fulfillment.carrierName,
              fulfillment.trackingNumber,
            ],
            search,
          ) &&
          (fulfillmentStatus === ALL_FILTER_VALUE || fulfillment.status === fulfillmentStatus) &&
          (fulfillmentMethod === ALL_FILTER_VALUE || fulfillment.method === fulfillmentMethod),
      ),
    [fulfillmentMethod, fulfillmentStatus, rawItems, search],
  );

  return (
    <div className="space-y-6">
      <StaffPageHeader
        eyebrow="E-commerce"
        title="Livraisons"
        icon={Truck}
        status={<StaffBadge color="#0a8dc1">{data?.stats.total ?? 0} dossiers</StaffBadge>}
      />

      <ErrorNotice error={error} onRetry={() => void reload()} />
      <ActionNotice error={actionError} message={actionMessage} />

      <MetricsGrid
        metrics={[
          { label: "Dossiers", value: data?.stats.total ?? 0 },
          { label: "En attente", value: data?.stats.pending ?? 0 },
          { label: "En transit", value: data?.stats.inTransit ?? 0 },
          { label: "Livrees", value: data?.stats.delivered ?? 0 },
        ]}
      />

      <SearchAndFilters
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Commande, client, tracking, transporteur..."
        resultCount={items.length}
        totalCount={rawItems.length}
      >
        <FilterSelect
          label="Statut"
          value={fulfillmentStatus}
          options={statusFilterOptions(fulfillmentStatusValues)}
          onChange={setFulfillmentStatus}
        />
        <FilterSelect
          label="Methode"
          value={fulfillmentMethod}
          options={[
            allOption("Toutes les methodes"),
            { value: "DELIVERY", label: formatStatus("DELIVERY") },
            { value: "PICKUP", label: formatStatus("PICKUP") },
          ]}
          onChange={setFulfillmentMethod}
        />
      </SearchAndFilters>

      <PanelTable
        columns={[
          "Commande",
          "Client",
          "Methode",
          "Statut",
          "Lieu / transport",
          "Tracking",
          "Planning",
          "Creation",
        ]}
        isLoading={isLoading}
        isEmpty={items.length === 0}
        error={error}
      >
        {items.map((fulfillment) => (
          <tr key={fulfillment.id} className="align-top">
            <td className="text-cobam-dark-blue px-4 py-4 font-semibold">
              {fulfillment.orderNumber}
            </td>
            <td className="px-4 py-4 text-slate-600">{fulfillment.customerLabel}</td>
            <td className="px-4 py-4 text-slate-600">{formatStatus(fulfillment.method)}</td>
            <td className="px-4 py-4">
              <StatusActionSelect
                value={fulfillment.status}
                options={fulfillmentStatusOptions}
                disabled={pendingId === fulfillment.id}
                onChange={(status) => {
                  if (status === fulfillment.status) return;

                  void runAction(
                    fulfillment.id,
                    () => updateEcommerceFulfillmentStatusAdminClient(fulfillment.id, { status }),
                    "Statut de livraison mis a jour.",
                  );
                }}
              />
            </td>
            <td className="px-4 py-4 text-slate-600">
              <p>{fulfillment.pickupLocation ?? fulfillment.carrierName ?? "-"}</p>
              <p className="text-xs text-slate-500">{fulfillment.carrierName ?? ""}</p>
            </td>
            <td className="px-4 py-4 text-slate-600">{fulfillment.trackingNumber ?? "-"}</td>
            <td className="px-4 py-4 text-slate-600">
              <p>{formatDate(fulfillment.scheduledAt ?? fulfillment.requestedDate)}</p>
              <p className="text-xs text-slate-500">
                Livre le {formatDate(fulfillment.deliveredAt)}
              </p>
            </td>
            <td className="px-4 py-4 text-slate-600">{formatDate(fulfillment.createdAt)}</td>
          </tr>
        ))}
      </PanelTable>
    </div>
  );
}
