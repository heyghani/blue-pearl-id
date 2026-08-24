import { AdminProductListPage } from "@/components/admin/admin-product-list-page";

export default async function AdminHalloweenProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    page?: string;
    status?: string;
    featured?: string;
    stock?: string;
    category?: string;
    brand?: string;
  }>;
}) {
  const params = await searchParams;
  return <AdminProductListPage catalog="halloween" searchParams={params} />;
}
