import { prisma } from "@/lib/server/db/prisma";

type ProductDeleteConstraintClient = Pick<
  typeof prisma,
  | "commercePromotionProduct"
  | "commerceStockReservation"
  | "productFamilyRedirect"
  | "shoppingCartItem"
>;

export type ProductDeleteBlockers = {
  promotionProducts: number;
  familyRedirects: number;
  shoppingCartItems: number;
  stockReservations: number;
};

export async function countProductDeleteBlockers(
  client: ProductDeleteConstraintClient,
  productIds: bigint[],
): Promise<ProductDeleteBlockers> {
  const uniqueProductIds = Array.from(new Set(productIds.map((id) => id.toString()))).map((id) =>
    BigInt(id),
  );

  if (uniqueProductIds.length === 0) {
    return {
      promotionProducts: 0,
      familyRedirects: 0,
      shoppingCartItems: 0,
      stockReservations: 0,
    };
  }

  const [promotionProducts, familyRedirects, shoppingCartItems, stockReservations] =
    await Promise.all([
      client.commercePromotionProduct.count({
        where: {
          productId: {
            in: uniqueProductIds,
          },
        },
      }),
      client.productFamilyRedirect.count({
        where: {
          defaultVariantId: {
            in: uniqueProductIds,
          },
        },
      }),
      client.shoppingCartItem.count({
        where: {
          productId: {
            in: uniqueProductIds,
          },
        },
      }),
      client.commerceStockReservation.count({
        where: {
          productId: {
            in: uniqueProductIds,
          },
        },
      }),
    ]);

  return {
    promotionProducts,
    familyRedirects,
    shoppingCartItems,
    stockReservations,
  };
}

export function hasProductDeleteBlockers(blockers: ProductDeleteBlockers) {
  return (
    blockers.promotionProducts > 0 ||
    blockers.familyRedirects > 0 ||
    blockers.shoppingCartItems > 0 ||
    blockers.stockReservations > 0
  );
}

function countLabel(count: number, singular: string, plural: string) {
  return `${count} ${count > 1 ? plural : singular}`;
}

export function buildProductDeleteBlockedMessage(blockers: ProductDeleteBlockers) {
  const details: string[] = [];

  if (blockers.shoppingCartItems > 0) {
    details.push(countLabel(blockers.shoppingCartItems, "ligne de panier", "lignes de panier"));
  }
  if (blockers.stockReservations > 0) {
    details.push(
      countLabel(blockers.stockReservations, "réservation de stock", "réservations de stock"),
    );
  }
  if (blockers.promotionProducts > 0) {
    details.push(
      countLabel(blockers.promotionProducts, "promotion commerciale", "promotions commerciales"),
    );
  }
  if (blockers.familyRedirects > 0) {
    details.push(
      countLabel(
        blockers.familyRedirects,
        "redirection de famille dissoute",
        "redirections de familles dissoutes",
      ),
    );
  }

  const detailText = details.join(", ");

  return `Suppression impossible : un ou plusieurs produits ont encore des références commerciales (${detailText}). Retirez ces références ou archivez les produits au lieu de les supprimer.`;
}
