import { toggleProductActiveAction } from "@/lib/actions/admin/products";
import { Button } from "@/components/ui/button";

export function ProductStatusToggle({
  productId,
  isActive,
}: {
  productId: string;
  isActive: boolean;
}) {
  const action = toggleProductActiveAction.bind(null, productId, !isActive);

  return (
    <form action={action}>
      <Button type="submit" variant="outline" size="sm">
        {isActive ? "Hide" : "Show"}
      </Button>
    </form>
  );
}
