import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, CircularProgress, Alert, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Select, MenuItem, TextField, Checkbox } from '@mui/material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getMarkets, getVariantMarkets, createVariantMarket, updateVariantMarket } from '../../../api/markets.api';
import type { VariantMarket } from '../../../api/markets.api';
import { useToast } from '../../../components/common/GlobalToastProvider';
import { getReadableErrorMessage } from '../../../utils/apiError';

interface Step5Props {
  variantId: string;
  onNext: () => void;
  onBack: () => void;
}

const Step5Markets: React.FC<Step5Props> = ({ variantId, onNext, onBack }) => {
  const queryClient = useQueryClient();

  // Fetch all master markets
  const { data: masterMarketsData, isLoading: isLoadingMaster } = useQuery({
    queryKey: ['markets', 'all'],
    queryFn: () => getMarkets({ limit: 100, status: 'active' })
  });

  // Fetch mapped markets for this variant
  const { data: mappedMarketsData, isLoading: isLoadingMapped } = useQuery({
    queryKey: ['variant-markets', variantId],
    queryFn: () => getVariantMarkets(variantId)
  });

  const [mappings, setMappings] = useState<Record<string, Partial<VariantMarket>>>({});
  const [dirtyMappings, setDirtyMappings] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (masterMarketsData?.data && mappedMarketsData?.data) {
      const initialMappings: Record<string, Partial<VariantMarket>> = {};
      
      masterMarketsData.data.forEach(market => {
        const existing = mappedMarketsData.data.find(m => 
          (m.marketId as any)?._id === market._id || m.marketId === market._id
        );
        
        initialMappings[market._id] = existing || {
          variantId,
          marketId: market._id,
          availabilityStatus: 'unavailable',
          status: 'active',
          isFeatured: false,
          pricing: {
            amount: 0,
            currencyCode: market.currencyCode || 'USD',
            priceType: 'starting'
          }
        };

        if (!initialMappings[market._id].pricing) {
          initialMappings[market._id].pricing = {
            amount: 0,
            currencyCode: market.currencyCode || 'USD',
            priceType: 'starting'
          };
        }
      });
      
      setMappings(initialMappings);
    }
  }, [masterMarketsData, mappedMarketsData, variantId]);

  const handleMappingChange = (marketId: string, field: keyof VariantMarket | string, value: any) => {
    setMappings(prev => {
      const current = { ...prev[marketId] };
      
      if (field.startsWith('pricing.')) {
        const pricingField = field.split('.')[1] as keyof NonNullable<VariantMarket['pricing']>;
        current.pricing = { ...current.pricing!, [pricingField]: value };
      } else {
        (current as any)[field] = value;
      }
      
      return { ...prev, [marketId]: current };
    });
    
    setDirtyMappings(prev => {
      const next = new Set(prev);
      next.add(marketId);
      return next;
    });
  };

  const saveMapping = async (mapping: Partial<VariantMarket>) => {
    // clean up payload
    const payload = JSON.parse(JSON.stringify(mapping));
    if (payload.availabilityStatus === 'unavailable') {
      // If we are making it unavailable and it didn't exist before, we might just not create it
      // But if it was created, we update it to 'unavailable'
      if (!mapping._id) return;
    }
    
    // Remove pricing if amount is 0/null/empty so it doesn't fail validation
    if (payload.pricing && (!payload.pricing.amount || payload.pricing.amount === 0)) {
      delete payload.pricing;
    }

    if (mapping._id) {
      await updateVariantMarket(variantId, mapping._id, payload);
    } else {
      await createVariantMarket(variantId, payload);
    }
  };

  const handleSaveAndNext = async () => {
    setIsSaving(true);
    try {
      const promises = Array.from(dirtyMappings).map(marketId => saveMapping(mappings[marketId]));
      await Promise.all(promises);
      
      queryClient.invalidateQueries({ queryKey: ['variant-markets', variantId] });
      onNext();
    } catch (err: any) {
      showToast(getReadableErrorMessage(err), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingMaster || isLoadingMapped) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  }

  const markets = masterMarketsData?.data || [];

  return (
    <Box>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Select which regions this vehicle variant is available in, and set its local pricing.
      </Typography>

      <Paper sx={{ mb: 4, overflow: 'hidden' }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell width="20%">Market / Region</TableCell>
                <TableCell width="25%">Availability</TableCell>
                <TableCell width="25%">Price</TableCell>
                <TableCell width="20%">Price Type</TableCell>
                <TableCell width="10%">Featured</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {markets.map((market) => {
                const mapping = mappings[market._id] || {};
                const pricing = mapping.pricing || { amount: '', currencyCode: market.currencyCode, priceType: 'starting' };
                
                return (
                  <TableRow key={market._id}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>{market.name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Select
                        size="small"
                        fullWidth
                        value={mapping.availabilityStatus || 'unavailable'}
                        onChange={(e) => handleMappingChange(market._id, 'availabilityStatus', e.target.value)}
                      >
                        <MenuItem value="unavailable">Unavailable</MenuItem>
                        <MenuItem value="available">Available</MenuItem>
                        <MenuItem value="upcoming">Upcoming</MenuItem>
                        <MenuItem value="discontinued">Discontinued</MenuItem>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                          size="small"
                          sx={{ width: '80px' }}
                          disabled
                          value={pricing.currencyCode}
                        />
                        <TextField
                          size="small"
                          fullWidth
                          type="number"
                          placeholder="Amount"
                          value={pricing.amount || ''}
                          onChange={(e) => handleMappingChange(market._id, 'pricing.amount', Number(e.target.value))}
                          disabled={mapping.availabilityStatus === 'unavailable'}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Select
                        size="small"
                        fullWidth
                        value={pricing.priceType || 'starting'}
                        onChange={(e) => handleMappingChange(market._id, 'pricing.priceType', e.target.value)}
                        disabled={mapping.availabilityStatus === 'unavailable'}
                      >
                        <MenuItem value="starting">Starting At</MenuItem>
                        <MenuItem value="msrp">MSRP</MenuItem>
                        <MenuItem value="ex_showroom">Ex-Showroom</MenuItem>
                        <MenuItem value="on_road">On Road</MenuItem>
                        <MenuItem value="other">Other</MenuItem>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Checkbox 
                        checked={mapping.isFeatured || false}
                        onChange={(e) => handleMappingChange(market._id, 'isFeatured', e.target.checked)}
                        disabled={mapping.availabilityStatus === 'unavailable'}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button onClick={onBack} variant="outlined" disabled={isSaving}>
          Back
        </Button>
        <Button onClick={handleSaveAndNext} variant="contained" disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save & Continue'}
        </Button>
      </Box>
    </Box>
  );
};

export default Step5Markets;
