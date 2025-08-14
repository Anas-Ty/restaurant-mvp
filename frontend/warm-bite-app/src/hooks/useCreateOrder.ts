// src/hooks/useCreateOrder.ts
import { useMutation } from '@tanstack/react-query';
import { createOrder, CreateOrderRequest, OrderResponse } from '@/lib/api';

export const useCreateOrder = () => {
  return useMutation<OrderResponse, Error, { qrCode?: string; orderData: CreateOrderRequest }>({
    mutationFn: ({ qrCode, orderData }) => {
      // createOrder supports both styles:
      if (qrCode) return createOrder(qrCode, orderData);
      return createOrder(orderData);
    },
  });
};
