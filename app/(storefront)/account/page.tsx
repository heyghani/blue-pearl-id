import Link from "next/link";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AccountPage() {
  const session = await auth();
  const user = session?.user?.id
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, email: true, emailVerified: true },
      })
    : null;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">
          Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
        </h2>
        <p className="mt-1 text-muted-foreground">{user?.email}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Orders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              View order history and track shipments.
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link href="/account/orders">View orders</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Addresses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Manage shipping addresses for faster checkout.
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link href="/account/addresses">Manage addresses</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {session?.user?.role === "ADMIN" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Admin</CardTitle>
          </CardHeader>
          <CardContent>
            <Button size="sm" asChild>
              <Link href="/admin">Go to admin dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
