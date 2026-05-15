import type { CommerceDiscountType } from "@prisma/client";

export type PromotionQuote = {
  code: string;
  name: string;
  discountType: CommerceDiscountType;
  subtotalTtc: string;
  eligibleSubtotalTtc: string;
  discountTtc: string;
  totalTtc: string;
  message: string;
};
