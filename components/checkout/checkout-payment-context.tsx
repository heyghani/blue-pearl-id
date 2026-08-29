"use client";

import { PaymentMethod } from "@prisma/client";
import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { getDefaultCheckoutPaymentMethod } from "@/lib/payments/default-method";

type CheckoutPaymentContextValue = {
  paymentMethod: PaymentMethod | null;
  setPaymentMethod: (method: PaymentMethod | null) => void;
};

const CheckoutPaymentContext = createContext<CheckoutPaymentContextValue | null>(
  null,
);

export function CheckoutPaymentProvider({ children }: { children: ReactNode }) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(
    getDefaultCheckoutPaymentMethod,
  );
  const value = useMemo(
    () => ({ paymentMethod, setPaymentMethod }),
    [paymentMethod],
  );

  return (
    <CheckoutPaymentContext.Provider value={value}>
      {children}
    </CheckoutPaymentContext.Provider>
  );
}

export function useCheckoutPaymentMethod() {
  return useContext(CheckoutPaymentContext);
}
