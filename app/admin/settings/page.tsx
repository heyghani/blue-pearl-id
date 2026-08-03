import { redirect } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminUsersTable } from "@/components/admin/admin-users-table";
import { ChangePasswordForm } from "@/components/admin/change-password-form";
import { CreateAdminForm } from "@/components/admin/create-admin-form";
import { DefaultBasePriceForm } from "@/components/admin/default-base-price-form";
import { getSession } from "@/lib/auth";
import { getDefaultBasePrice } from "@/lib/services/admin/store-settings.service";
import { listAdminUsers } from "@/lib/services/admin/user.service";

export default async function AdminSettingsPage() {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/admin/settings");
  }

  const [admins, defaultBasePrice] = await Promise.all([
    listAdminUsers(),
    getDefaultBasePrice(),
  ]);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Settings"
        description="Manage admin accounts, passwords, and store defaults."
      />

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <section className="space-y-4">
          <div className="border-b pb-2">
            <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
              Admin users
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              People who can sign in to this dashboard.
            </p>
          </div>
          <div className="space-y-6">
            <AdminUsersTable
              admins={admins}
              currentUserId={session.user.id}
            />
            <CreateAdminForm />
          </div>
        </section>

        <div className="space-y-8">
          <section className="space-y-4">
            <div className="border-b pb-2">
              <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                Product defaults
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Values applied when creating a new product.
              </p>
            </div>
            <DefaultBasePriceForm defaultBasePrice={defaultBasePrice} />
          </section>

          <section className="space-y-4">
            <div className="border-b pb-2">
              <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                Your password
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Change the password for the account you’re signed in with.
              </p>
            </div>
            <ChangePasswordForm />
          </section>
        </div>
      </div>
    </div>
  );
}
