import { redirect } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminUsersTable } from "@/components/admin/admin-users-table";
import { ChangePasswordForm } from "@/components/admin/change-password-form";
import { CreateAdminForm } from "@/components/admin/create-admin-form";
import { getSession } from "@/lib/auth";
import { listAdminUsers } from "@/lib/services/admin/user.service";

export default async function AdminSettingsPage() {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/admin/settings");
  }

  const admins = await listAdminUsers();

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Settings"
        description="Manage admin accounts, passwords, and store access."
      />

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <AdminUsersTable
            admins={admins}
            currentUserId={session.user.id}
          />
          <CreateAdminForm />
        </div>

        <div>
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
