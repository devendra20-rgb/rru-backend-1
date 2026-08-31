import React from 'react';
import { Box, Button, Typography, Paper, Divider, CircularProgress } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { getVariant } from '../../../api/variants.api';
import { getVariantSpecifications } from '../../../api/specifications.api';
import { getVariantFeatures } from '../../../api/features.api';
import { getVariantColors } from '../../../api/colors.api';
import { getVariantMarkets } from '../../../api/markets.api';
import { getVariantMedia } from '../../../api/media.api';
import { resolveMediaUrl, getPlaceholderImage } from '../../../utils/media';
import { useNavigate } from 'react-router-dom';

interface Step7Props {
  variantId: string;
  onBack: () => void;
}

const Step7Review: React.FC<Step7Props> = ({ variantId, onBack }) => {
  const navigate = useNavigate();

  const { data: variantData, isLoading: load1 } = useQuery({ queryKey: ['variants', variantId], queryFn: () => getVariant(variantId) });
  const { data: specsData, isLoading: load2 } = useQuery({ queryKey: ['specifications', variantId], queryFn: () => getVariantSpecifications(variantId), retry: false });
  const { data: featuresData, isLoading: load3 } = useQuery({ queryKey: ['variant-features', variantId], queryFn: () => getVariantFeatures(variantId) });
  const { data: colorsData, isLoading: load4 } = useQuery({ queryKey: ['variant-colors', variantId], queryFn: () => getVariantColors(variantId) });
  const { data: marketsData, isLoading: load5 } = useQuery({ queryKey: ['variant-markets', variantId], queryFn: () => getVariantMarkets(variantId) });
  const { data: mediaData, isLoading: load6 } = useQuery({ queryKey: ['variant-media', variantId], queryFn: () => getVariantMedia(variantId) });

  const isLoading = load1 || load2 || load3 || load4 || load5 || load6;

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  }

  const variant = variantData?.data;
  const spec = specsData?.data;
  
  const getArray = (resData: any, keys: string[]) => {
    if (!resData) return [];
    if (Array.isArray(resData)) return resData;
    for (const key of keys) {
      if (Array.isArray(resData[key])) return resData[key];
    }
    return [];
  };

  const features = getArray(featuresData?.data, ['variantFeatures', 'features']);
  const colors = getArray(colorsData?.data, ['variantColors', 'colors']);
  const markets = getArray(marketsData?.data, ['variantMarkets', 'markets']);
  const mediaList = getArray(mediaData?.data, ['media']);

  const activeFeatures = features.filter((f: any) => f.availability !== 'unavailable');
  const activeColors = colors.filter((c: any) => c.availability !== 'unavailable');
  const activeMarkets = markets.filter((m: any) => m.availabilityStatus !== 'unavailable');

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Review Vehicle Data</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Please review all the details before completing the vehicle data entry process.
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>1. Basic Information</Typography>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }, gap: 2 }}>
          <Box><Typography variant="body2" color="text.secondary">Name</Typography><Typography>{variant?.name || '-'}</Typography></Box>
          <Box><Typography variant="body2" color="text.secondary">Code</Typography><Typography>{variant?.variantCode || '-'}</Typography></Box>
          <Box><Typography variant="body2" color="text.secondary">Model Year</Typography><Typography>{variant?.modelYear || '-'}</Typography></Box>
          <Box><Typography variant="body2" color="text.secondary">Status</Typography><Typography sx={{ textTransform: 'capitalize' }}>{variant?.status || '-'}</Typography></Box>
          <Box><Typography variant="body2" color="text.secondary">Fuel Type</Typography><Typography sx={{ textTransform: 'capitalize' }}>{variant?.fuelType || '-'}</Typography></Box>
          <Box><Typography variant="body2" color="text.secondary">Transmission</Typography><Typography sx={{ textTransform: 'capitalize' }}>{variant?.transmissionType || '-'}</Typography></Box>
          <Box><Typography variant="body2" color="text.secondary">Drivetrain</Typography><Typography sx={{ textTransform: 'uppercase' }}>{variant?.drivetrain || '-'}</Typography></Box>
          <Box><Typography variant="body2" color="text.secondary">Doors / Seating</Typography><Typography>{variant?.doors || '-'} Doors / {variant?.seatingCapacity || '-'} Seats</Typography></Box>
          <Box><Typography variant="body2" color="text.secondary">Engine Config</Typography><Typography>{variant?.engine?.cylinders ? `${variant?.engine?.cylinders}-Cyl` : '-'} {variant?.engine?.aspiration || ''}</Typography></Box>
          <Box><Typography variant="body2" color="text.secondary">Displacement</Typography><Typography>{variant?.engine?.displacementCc ? `${variant?.engine?.displacementCc} cc` : '-'}</Typography></Box>
          <Box><Typography variant="body2" color="text.secondary">Power</Typography><Typography>{variant?.engine?.powerHp ? `${variant?.engine?.powerHp} hp` : '-'}</Typography></Box>
          <Box><Typography variant="body2" color="text.secondary">Torque</Typography><Typography>{variant?.engine?.torqueNm ? `${variant?.engine?.torqueNm} Nm` : '-'}</Typography></Box>
        </Box>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>2. Specifications</Typography>
        <Divider sx={{ mb: 2 }} />
        {spec ? (
           <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }, gap: 3 }}>
             {/* Performance */}
             <Box>
               <Typography variant="subtitle2" gutterBottom>Performance</Typography>
               <Typography variant="body2" color="text.secondary">Top Speed: <Box component="span" sx={{ color: 'text.primary' }}>{spec.performance?.topSpeedKph ? `${spec.performance.topSpeedKph} km/h` : '-'}</Box></Typography>
               <Typography variant="body2" color="text.secondary">0-100 km/h: <Box component="span" sx={{ color: 'text.primary' }}>{spec.performance?.acceleration0To100Kph ? `${spec.performance.acceleration0To100Kph}s` : '-'}</Box></Typography>
             </Box>
             
             {/* Dimensions */}
             <Box>
               <Typography variant="subtitle2" gutterBottom>Dimensions</Typography>
               <Typography variant="body2" color="text.secondary">LxWxH: <Box component="span" sx={{ color: 'text.primary' }}>{spec.dimensions?.lengthMm || '-'} x {spec.dimensions?.widthMm || '-'} x {spec.dimensions?.heightMm || '-'} mm</Box></Typography>
               <Typography variant="body2" color="text.secondary">Wheelbase: <Box component="span" sx={{ color: 'text.primary' }}>{spec.dimensions?.wheelbaseMm ? `${spec.dimensions.wheelbaseMm} mm` : '-'}</Box></Typography>
               <Typography variant="body2" color="text.secondary">Clearance: <Box component="span" sx={{ color: 'text.primary' }}>{spec.dimensions?.groundClearanceMm ? `${spec.dimensions.groundClearanceMm} mm` : '-'}</Box></Typography>
             </Box>

             {/* Capacity & Weight */}
             <Box>
               <Typography variant="subtitle2" gutterBottom>Capacity & Weight</Typography>
               <Typography variant="body2" color="text.secondary">Boot/Fuel: <Box component="span" sx={{ color: 'text.primary' }}>{spec.capacity?.bootSpaceLitres || '-'} L / {spec.capacity?.fuelTankLitres || '-'} L</Box></Typography>
               <Typography variant="body2" color="text.secondary">Kerb Wt: <Box component="span" sx={{ color: 'text.primary' }}>{spec.weight?.kerbWeightKg ? `${spec.weight.kerbWeightKg} kg` : '-'}</Box></Typography>
               <Typography variant="body2" color="text.secondary">Gross Wt: <Box component="span" sx={{ color: 'text.primary' }}>{spec.weight?.grossWeightKg ? `${spec.weight.grossWeightKg} kg` : '-'}</Box></Typography>
             </Box>

             {/* Safety & Fuel */}
             <Box>
               <Typography variant="subtitle2" gutterBottom>Safety</Typography>
               <Typography variant="body2" color="text.secondary">Airbags: <Box component="span" sx={{ color: 'text.primary' }}>{spec.safety?.airbags || '-'}</Box></Typography>
               <Typography variant="body2" color="text.secondary">Safety Tech: <Box component="span" sx={{ color: 'text.primary' }}>{[spec.safety?.abs && 'ABS', spec.safety?.tractionControl && 'TC', spec.safety?.stabilityControl && 'ESC'].filter(Boolean).join(', ') || '-'}</Box></Typography>
               <Typography variant="body2" color="text.secondary">Sensors/Cam: <Box component="span" sx={{ color: 'text.primary' }}>{spec.safety?.parkingSensors || 'None'} / {spec.safety?.camera || 'None'}</Box></Typography>
             </Box>
           </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">No specifications added.</Typography>
        )}
      </Paper>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 3 }}>
        <Box>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>3. Features ({activeFeatures.length})</Typography>
            <Divider sx={{ mb: 2 }} />
            {activeFeatures.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {activeFeatures.map((f: any) => (
                  <Box key={f._id} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">{f.featureId?.name || 'Unknown Feature'}</Typography>
                    <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                      {f.value ? `${f.value} (${f.availability})` : f.availability}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">No features equipped.</Typography>
            )}
          </Paper>
        </Box>
        
        <Box>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>4. Colors ({activeColors.length})</Typography>
            <Divider sx={{ mb: 2 }} />
            {activeColors.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {activeColors.map((c: any) => (
                  <Box key={c._id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: c.colorId?.hexCode || '#ccc', border: '1px solid #ddd' }} />
                    <Typography variant="body2" color="text.secondary">{c.colorId?.name || 'Unknown'} <Typography component="span" variant="caption">({c.colorId?.type})</Typography></Typography>
                    <Box sx={{ flexGrow: 1 }} />
                    <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>{c.availability}</Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">No colors available.</Typography>
            )}
          </Paper>
        </Box>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>5. Pricing & Markets</Typography>
        <Divider sx={{ mb: 2 }} />
        {activeMarkets.length > 0 ? (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
            {activeMarkets.map((m: any) => (
              <Box key={m._id} sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <Typography variant="subtitle2">{m.marketId?.name || 'Market'}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{m.pricing?.currencyCode} {m.pricing?.amount?.toLocaleString() || 0}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                  {m.pricing?.priceType?.replace('_', ' ')} • {m.availabilityStatus}
                </Typography>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">No markets configured.</Typography>
        )}
      </Paper>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>6. Media</Typography>
        <Divider sx={{ mb: 2 }} />
        {mediaList.length > 0 ? (
          <Box sx={{ display: 'flex', gap: 2, mt: 2, overflowX: 'auto', pb: 1 }}>
            {mediaList.map((m: any) => (
              <Box key={m._id} sx={{ position: 'relative', flexShrink: 0 }}>
                <Box 
                  component="img" 
                  src={resolveMediaUrl(m.url)} 
                  alt={m.altText || 'Media'}
                  onError={(e: any) => { e.target.src = getPlaceholderImage(m.altText || 'Media', 120, 80); }}
                  sx={{ 
                    height: 80, 
                    borderRadius: 1, 
                    border: m.isPrimary ? '2px solid #1976d2' : '1px solid #ddd',
                    objectFit: 'cover',
                    bgcolor: 'grey.100'
                  }} 
                />
                {m.isPrimary && (
                  <Box sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'primary.main', color: 'white', px: 1, py: 0.25, borderRadius: 1, fontSize: '0.65rem', fontWeight: 'bold' }}>
                    Primary
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">No media uploaded.</Typography>
        )}
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button onClick={onBack} variant="outlined">
          Back
        </Button>
        <Button onClick={() => navigate('/cars')} variant="contained" color="success">
          Complete & Return to List
        </Button>
      </Box>
    </Box>
  );
};

export default Step7Review;
