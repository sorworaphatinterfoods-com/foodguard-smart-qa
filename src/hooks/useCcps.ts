import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import { mockHACCPCCPs } from '@/lib/mock-data';
import type { CcpMaster } from '@/lib/types';

// Bundled mock data uses the richer HACCPCCPItem shape; map it down to the
// CcpMaster fields the live `ccp_master` table provides so fallback matches.
const fallbackCcps: CcpMaster[] = mockHACCPCCPs.map((ccp, idx) => ({
  id: `CCP-${idx + 1}`,
  process: ccp.process,
  ccpName: ccp.hazard,
  criticalLimit: ccp.criticalLimit,
}));

// CCP master/plan from the live D1-backed API, with mock fallback.
export function useCcps() {
  return useQuery<CcpMaster[]>({
    queryKey: ['ccps'],
    queryFn: async () => {
      try {
        return await apiGet<CcpMaster[]>('/api/ccps');
      } catch {
        return fallbackCcps;
      }
    },
    staleTime: 60_000,
  });
}
