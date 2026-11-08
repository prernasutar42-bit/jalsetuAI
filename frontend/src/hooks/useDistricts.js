import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDistricts, getDistrictById, refreshPredictions } from '../api/districts';

export function useDistricts() {
  return useQuery({
    queryKey: ['districts'],
    queryFn: getDistricts,
    staleTime: 60 * 1000,
  });
}

export function useDistrict(id) {
  return useQuery({
    queryKey: ['district', id],
    queryFn: () => getDistrictById(id),
    enabled: Boolean(id),
    staleTime: 60 * 1000,
  });
}

export function useRefreshPredictions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: refreshPredictions,
    onSuccess: (data) => {
      queryClient.setQueryData(['districts'], data);
      data.forEach((dist) => {
        queryClient.setQueryData(['district', dist.id], dist);
      });
    },
  });
}
