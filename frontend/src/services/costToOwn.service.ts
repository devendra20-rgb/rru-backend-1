import { api, USE_MOCK } from '@/lib/api';
import { costToOwnMock, segmentComparisonMock } from '@/data/homepage.mock';
import type { CostToOwnBreakdown, CostToOwnInput, SegmentComparison } from '@/types/cost';

export const costToOwnService = {
  calculate: async (input: Partial<CostToOwnInput>): Promise<CostToOwnBreakdown> => {
    if (USE_MOCK) return costToOwnMock;
    const res = await api.post<{ data: CostToOwnBreakdown }>('/api/v1/cost-to-own/calculate', input);
    return res.data;
  },

  getSegmentComparison: async (segment: string): Promise<SegmentComparison[]> => {
    if (USE_MOCK) return segmentComparisonMock;
    const res = await api.get<{ data: SegmentComparison[] }>(`/api/v1/cost-to-own/segment/${segment}`);
    return res.data;
  },
};
