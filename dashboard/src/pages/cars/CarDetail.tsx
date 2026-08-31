import React from 'react';
import { Box, Button, Typography, Paper, Divider, CircularProgress, Chip } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';

import { getVariant } from '../../api/variants.api';
import { getVariantSpecifications } from '../../api/specifications.api';
import { getVariantFeatures } from '../../api/features.api';
import { getVariantColors } from '../../api/colors.api';
import { getVariantMarkets } from '../../api/markets.api';
import { getVariantMedia } from '../../api/media.api';
import { resolveMediaUrl, getPlaceholderImage } from '../../utils/media';

const CarDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: variantData, isLoading: load1 } = useQuery({ queryKey: ['variants', id], queryFn: () => getVariant(id!) });
  const { data: specsData, isLoading: load2 } = useQuery({ queryKey: ['specifications', id], queryFn: () => getVariantSpecifications(id!), retry: false });
  const { data: featuresData, isLoading: load3 } = useQuery({ queryKey: ['variant-features', id], queryFn: () => getVariantFeatures(id!) });
  const { data: colorsData, isLoading: load4 } = useQuery({ queryKey: ['variant-colors', id], queryFn: () => getVariantColors(id!) });
  const { data: marketsData, isLoading: load5 } = useQuery({ queryKey: ['variant-markets', id], queryFn: () => getVariantMarkets(id!) });
  const { data: mediaData, isLoading: load6 } = useQuery({ queryKey: ['variant-media', id], queryFn: () => getVariantMedia(id!) });

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

  if (!variant) {
    return <Typography>Variant not found</Typography>;
  }

  const primaryImage = mediaList.find((m: any) => m.isPrimary) || mediaList[0];

  return (
    <Box sx={{ width: '100%', pb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate('/cars')}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h4" component="h1">
            {variant.name}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip 
            label={variant.status} 
            color={variant.status === 'active' ? 'success' : variant.status === 'draft' ? 'warning' : 'default'}
            sx={{ textTransform: 'capitalize' }}
          />
          <Button 
            startIcon={<EditIcon />} 
            variant="contained"
            onClick={() => navigate(`/cars/${id}/edit`)}
          >
            Edit Vehicle
          </Button>
        </Box>
      </Box>

      {/* Header Info */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' }, gap: 3, alignItems: 'center' }}>
          <Box>
            {primaryImage ? (
              <Box 
                component="img" 
                src={resolveMediaUrl(primaryImage.url)} 
                alt={variant.name} 
                onError={(e: any) => { e.target.src = getPlaceholderImage(variant.name || 'Vehicle', 400, 250); }}
                sx={{ width: '100%', height: 'auto', borderRadius: 1, maxHeight: 250, objectFit: 'cover', bgcolor: 'grey.100' }}
              />
            ) : (
              <Box sx={{ width: '100%', height: 200, bgcolor: 'grey.200', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 1 }}>
                <Typography color="text.secondary">No Primary Image</Typography>
              </Box>
            )}
          </Box>
          <Box>
            <Typography variant="h5" gutterBottom>Overview</Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">Generation</Typography>
                <Typography>{variant.generationId?.name || '-'}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Variant Code</Typography>
                <Typography>{variant.variantCode || '-'}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Model Year</Typography>
                <Typography>{variant.modelYear || '-'}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Fuel Type</Typography>
                <Typography sx={{ textTransform: 'capitalize' }}>{variant.fuelType || '-'}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Transmission</Typography>
                <Typography sx={{ textTransform: 'capitalize' }}>{variant.transmissionType || '-'}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Drivetrain</Typography>
                <Typography sx={{ textTransform: 'uppercase' }}>{variant.drivetrain || '-'}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Engine Capacity</Typography>
                <Typography>{variant.engine?.displacementCc ? `${variant.engine.displacementCc} cc` : '-'}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Power / Torque</Typography>
                <Typography>{variant.engine?.powerHp ? `${variant.engine.powerHp} HP` : '-'} / {variant.engine?.torqueNm ? `${variant.engine.torqueNm} Nm` : '-'}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Seating Capacity</Typography>
                <Typography>{variant.seatingCapacity || '-'}</Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Specifications */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Specifications</Typography>
        <Divider sx={{ mb: 2 }} />
        {spec ? (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 4 }}>
            <Box>
              <Typography variant="subtitle2" gutterBottom>Performance</Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Top Speed: <Box component="span" color="text.primary">{spec.performance?.topSpeedKph ? `${spec.performance.topSpeedKph} km/h` : '-'}</Box></Typography>
                <Typography variant="body2" color="text.secondary">0-100 km/h: <Box component="span" color="text.primary">{spec.performance?.acceleration0To100Kph ? `${spec.performance.acceleration0To100Kph}s` : '-'}</Box></Typography>
              </Box>

              <Typography variant="subtitle2" gutterBottom>Safety</Typography>
              <Box>
                <Typography variant="body2" color="text.secondary">Airbags: <Box component="span" color="text.primary">{spec.safety?.airbags || '-'}</Box></Typography>
                <Typography variant="body2" color="text.secondary">ABS: <Box component="span" color="text.primary">{spec.safety?.abs ? 'Yes' : 'No'}</Box></Typography>
                <Typography variant="body2" color="text.secondary">Traction Control: <Box component="span" color="text.primary">{spec.safety?.tractionControl ? 'Yes' : 'No'}</Box></Typography>
                <Typography variant="body2" color="text.secondary">Stability Control: <Box component="span" color="text.primary">{spec.safety?.stabilityControl ? 'Yes' : 'No'}</Box></Typography>
                <Typography variant="body2" color="text.secondary">Parking Sensors: <Box component="span" color="text.primary">{spec.safety?.parkingSensors || '-'}</Box></Typography>
                <Typography variant="body2" color="text.secondary">Camera: <Box component="span" color="text.primary">{spec.safety?.camera || '-'}</Box></Typography>
              </Box>
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom>Dimensions</Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Length: <Box component="span" color="text.primary">{spec.dimensions?.lengthMm ? `${spec.dimensions.lengthMm} mm` : '-'}</Box></Typography>
                <Typography variant="body2" color="text.secondary">Width: <Box component="span" color="text.primary">{spec.dimensions?.widthMm ? `${spec.dimensions.widthMm} mm` : '-'}</Box></Typography>
                <Typography variant="body2" color="text.secondary">Height: <Box component="span" color="text.primary">{spec.dimensions?.heightMm ? `${spec.dimensions.heightMm} mm` : '-'}</Box></Typography>
                <Typography variant="body2" color="text.secondary">Wheelbase: <Box component="span" color="text.primary">{spec.dimensions?.wheelbaseMm ? `${spec.dimensions.wheelbaseMm} mm` : '-'}</Box></Typography>
                <Typography variant="body2" color="text.secondary">Ground Clearance: <Box component="span" color="text.primary">{spec.dimensions?.groundClearanceMm ? `${spec.dimensions.groundClearanceMm} mm` : '-'}</Box></Typography>
              </Box>
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom>Capacities & Weight</Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Boot Space: <Box component="span" color="text.primary">{spec.capacity?.bootSpaceLitres ? `${spec.capacity.bootSpaceLitres} L` : '-'}</Box></Typography>
                <Typography variant="body2" color="text.secondary">Fuel Tank: <Box component="span" color="text.primary">{spec.capacity?.fuelTankLitres ? `${spec.capacity.fuelTankLitres} L` : '-'}</Box></Typography>
                <Typography variant="body2" color="text.secondary">Kerb Weight: <Box component="span" color="text.primary">{spec.weight?.kerbWeightKg ? `${spec.weight.kerbWeightKg} kg` : '-'}</Box></Typography>
                <Typography variant="body2" color="text.secondary">Gross Weight: <Box component="span" color="text.primary">{spec.weight?.grossWeightKg ? `${spec.weight.grossWeightKg} kg` : '-'}</Box></Typography>
              </Box>
            </Box>
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">No specifications available.</Typography>
        )}
      </Paper>

      {/* Features & Colors */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 3 }}>
        <Box>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Features</Typography>
            <Divider sx={{ mb: 2 }} />
            {features.filter((f: any) => f.availability !== 'unavailable').length > 0 ? (
              <Box>
                {features.filter((f: any) => f.availability !== 'unavailable').map((f: any) => (
                  <Box key={f._id} sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">{f.featureId?.name || 'Feature'}</Typography>
                    <Box>
                      {f.value && <Typography variant="caption" sx={{ mr: 1 }} color="text.secondary">{f.value}</Typography>}
                      <Chip size="small" label={f.availability} color={f.availability === 'standard' ? 'primary' : 'default'} />
                    </Box>
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
            <Typography variant="h6" gutterBottom>Colors</Typography>
            <Divider sx={{ mb: 2 }} />
            {colors.filter((c: any) => c.availability !== 'unavailable').length > 0 ? (
              <Box>
                {colors.filter((c: any) => c.availability !== 'unavailable').map((c: any) => (
                  <Box key={c._id} sx={{ mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: c.colorId?.hexCode || '#ccc', mr: 1, border: '1px solid #ddd' }} />
                      <Typography variant="body2">{c.colorId?.name || 'Color'}</Typography>
                    </Box>
                    <Chip size="small" label={c.availability} color={c.availability === 'standard' ? 'primary' : 'default'} />
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">No colors available.</Typography>
            )}
          </Paper>
        </Box>
      </Box>

      {/* Markets & Pricing */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Pricing & Markets</Typography>
        <Divider sx={{ mb: 2 }} />
        {markets.filter((m: any) => m.availabilityStatus !== 'unavailable').length > 0 ? (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
            {markets.filter((m: any) => m.availabilityStatus !== 'unavailable').map((m: any) => (
              <Box key={m._id}>
                <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }} gutterBottom>{m.marketId?.name || 'Market'}</Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>Availability: <Box component="span" sx={{ textTransform: 'capitalize', color: 'text.primary' }}>{m.availabilityStatus}</Box></Typography>
                  {m.pricing?.amount ? (
                    <Typography variant="h6" color="primary.main">
                      {m.pricing.currencyCode} {m.pricing.amount.toLocaleString()} 
                      <Typography component="span" variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>({m.pricing.priceType})</Typography>
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary">Pricing TBA</Typography>
                  )}
                  {m.isFeatured && <Chip size="small" label="Featured" color="secondary" sx={{ mt: 1 }} />}
                </Box>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">Not available in any markets.</Typography>
        )}
      </Paper>

      {/* Media Gallery */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Media Gallery</Typography>
        <Divider sx={{ mb: 2 }} />
        {mediaList.length > 0 ? (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)', lg: 'repeat(6, 1fr)' }, gap: 2 }}>
            {mediaList.map((m: any) => (
              <Box key={m._id}>
                <Box 
                  component="img" 
                  src={resolveMediaUrl(m.url)} 
                  onError={(e: any) => { e.target.src = 'https://placehold.co/120x120?text=Error'; }}
                  sx={{ 
                    width: '100%', 
                    height: 120, 
                    objectFit: 'cover', 
                    borderRadius: 1,
                    border: m.isPrimary ? '2px solid #1976d2' : '1px solid #eee'
                  }} 
                />
                {m.isPrimary && <Typography variant="caption" color="primary" sx={{ display: 'block', textAlign: 'center', mt: 0.5 }}>Primary Image</Typography>}
              </Box>
            ))}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">No media uploaded.</Typography>
        )}
      </Paper>

    </Box>
  );
};

export default CarDetail;
