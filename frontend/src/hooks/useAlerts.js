import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAlerts, createAlert } from '../api/alerts';

export function useAlerts() {
  return useQuery({
    queryKey: ['alerts'],
    queryFn: getAlerts,
    staleTime: 30 * 1000,
  });
}

export function useCreateAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAlert,
    onSuccess: (newAlert) => {
      queryClient.setQueryData(['alerts'], (old = []) => [newAlert, ...old]);
    },
  });
}
