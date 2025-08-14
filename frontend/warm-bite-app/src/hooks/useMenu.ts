import { useQuery } from '@tanstack/react-query';
import { getMenuByQR } from '@/lib/api';

export const useMenu = (qrCode: string | undefined) => {
  return useQuery({
    queryKey: ['menu', qrCode],
    queryFn: () => getMenuByQR(qrCode!),
    enabled: !!qrCode,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
