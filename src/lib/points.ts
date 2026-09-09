import {
  MIN_REDEEM_POINTS,
  MIN_REDEEM_SUBTOTAL,
  POINT_VALUE_FCFA,
  POINTS_PER_100_FCFA,
} from "@/lib/constants";

export function spendPointsFor(amountFcfa: number) {
  if (amountFcfa < 100) {
    return 0;
  }

  return Math.floor(amountFcfa / 100) * POINTS_PER_100_FCFA;
}

export function canRedeemPoints(points: number, subtotalFcfa: number) {
  return points >= MIN_REDEEM_POINTS && subtotalFcfa >= MIN_REDEEM_SUBTOTAL;
}

export function redeemableDiscount(points: number, subtotalFcfa: number) {
  if (!canRedeemPoints(points, subtotalFcfa)) {
    return 0;
  }

  return Math.min(points * POINT_VALUE_FCFA, subtotalFcfa);
}
