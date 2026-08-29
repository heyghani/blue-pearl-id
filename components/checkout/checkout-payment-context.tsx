"use client";

import { PaymentMethod } from "@prisma/client";
import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { ENABLE_CREDIT_CARD_PAYMENT, ENABLE_USDT_PAYMENT } from "@/lib/constants";

type CheckoutPaymentContextValue = {
  paymentMethod: PaymentMethod | null;
  setPaymentMethod: (method: PaymentMethod | null) => void;
};

const CheckoutPaymentContext = createContext<CheckoutPaymentContextValue | null>(
  null,
);

function defaultCheckoutPaymentMethod(): PaymentMethod {
  if (ENABLE_CREDIT_CARD_PAYMENT) return PaymentMethod.CREDIT_CARD;
  if (ENABLE_USDT_PAYMENT) return PaymentMethod.USDT;
  return PaymentMethod.PAYPAL;
}

export function CheckoutPaymentProvider({ children }: { children: ReactNode }) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(
    defaultCheckoutPaymentMethod,
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
