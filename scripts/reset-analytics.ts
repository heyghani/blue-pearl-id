import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function hasConfirmFlag() {
  return process.argv.includes("--confirm");
}

function usage() {
  console.log(`Reset dashboard analytics (orders, payments, traffic, abandoned checkouts).

Usage:
  npm run analytics:reset -- --confirm

This permanently deletes:
  - All orders and order items
  - All payments, payment events, and refunds
  - All abandoned checkouts
  - All page view records
  - Resets coupon usage counters

Products, categories, brands, customers, and carts are NOT deleted.

Add --confirm to proceed.`);
}

async function resetAnalytics() {
  const [
    refundCount,
    paymentEventCount,
    paymentCount,
    abandonedCheckoutCount,
    orderItemCount,
    orderCount,
    pageViewCount,
    couponCount,
  ] = await Promise.all([
    prisma.refund.count(),
    prisma.paymentEvent.count(),
    prisma.payment.count(),
    prisma.abandonedCheckout.count(),
    prisma.orderItem.count(),
    prisma.order.count(),
    prisma.pageView.count(),
    prisma.coupon.count({ where: { usedCount: { gt: 0 } } }),
  ]);

  console.log("Current analytics data:");
  console.log(`  Orders:              ${orderCount}`);
  console.log(`  Order items:         ${orderItemCount}`);
  console.log(`  Payments:            ${paymentCount}`);
  console.log(`  Payment events:      ${paymentEventCount}`);
  console.log(`  Refunds:             ${refundCount}`);
  console.log(`  Abandoned checkouts: ${abandonedCheckoutCount}`);
  console.log(`  Page views:          ${pageViewCount}`);
  console.log(`  Coupons with usage:  ${couponCount}`);
  console.log("");

  await prisma.$transaction(async (tx) => {
    const deletedRefunds = await tx.refund.deleteMany();
    const deletedPaymentEvents = await tx.paymentEvent.deleteMany();
    const deletedPayments = await tx.payment.deleteMany();
    const deletedAbandonedCheckouts = await tx.abandonedCheckout.deleteMany();
    const deletedOrderItems = await tx.orderItem.deleteMany();
    const deletedOrders = await tx.order.deleteMany();
    const deletedPageViews = await tx.pageView.deleteMany();
    const resetCoupons = await tx.coupon.updateMany({
      data: { usedCount: 0 },
    });

    console.log("Deleted:");
    console.log(`  Refunds:             ${deletedRefunds.count}`);
    console.log(`  Payment events:      ${deletedPaymentEvents.count}`);
    console.log(`  Payments:            ${deletedPayments.count}`);
    console.log(`  Abandoned checkouts: ${deletedAbandonedCheckouts.count}`);
    console.log(`  Order items:         ${deletedOrderItems.count}`);
    console.log(`  Orders:              ${deletedOrders.count}`);
    console.log(`  Page views:          ${deletedPageViews.count}`);
    console.log(`  Coupon counters reset: ${resetCoupons.count}`);
  });

  console.log("\nDashboard analytics reset complete.");
}

async function main() {
  if (!hasConfirmFlag()) {
    usage();
    process.exit(1);
  }

  await resetAnalytics();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
