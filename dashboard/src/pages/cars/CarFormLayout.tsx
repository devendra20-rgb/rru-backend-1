import React, { useState } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Paper,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import StepConnector, { stepConnectorClasses } from '@mui/material/StepConnector';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import Step1BasicInfo     from './steps/Step1BasicInfo';
import Step2Specifications from './steps/Step2Specifications';
import Step3Features      from './steps/Step3Features';
import Step4Colors        from './steps/Step4Colors';
import Step5Markets       from './steps/Step5Markets';
import Step6Media         from './steps/Step6Media';
import Step7Review        from './steps/Step7Review';

const steps = [
  'Basic Info',
  'Specs',
  'Features',
  'Colors',
  'Markets',
  'Media',
  'Review',
];

// ─── Gradient connector ───────────────────────────────────────────────────────
const GradientConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 16,
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      background: theme.palette.primary.main,
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 2,
    border: 0,
    backgroundColor: theme.palette.divider,
    borderRadius:    1,
  },
}));

// ─── Main component ───────────────────────────────────────────────────────────
const CarFormLayout: React.FC = () => {
  const { id }      = useParams<{ id: string }>();
  const navigate    = useNavigate();
  const isEditMode  = !!id;

  const [activeStep, setActiveStep] = useState(0);
  const [variantId,  setVariantId]  = useState<string | null>(id || null);

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Step1BasicInfo
            variantId={variantId}
            setVariantId={setVariantId}
            onNext={handleNext}
            isNewVehicle={!isEditMode}
          />
        );
      case 1:
        return (
          <Step2Specifications
            variantId={variantId!}
            onNext={handleNext}
            onBack={handleBack}
            isNewVehicle={!isEditMode}
          />
        );
      case 2:
        return <Step3Features variantId={variantId!} onNext={handleNext} onBack={handleBack} />;
      case 3:
        return <Step4Colors   variantId={variantId!} onNext={handleNext} onBack={handleBack} />;
      case 4:
        return <Step5Markets  variantId={variantId!} onNext={handleNext} onBack={handleBack} />;
      case 5:
        return <Step6Media    variantId={variantId!} onNext={handleNext} onBack={handleBack} />;
      case 6:
        return <Step7Review   variantId={variantId!} onBack={handleBack} />;
      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/cars')}
          sx={{ mr: 2 }}
        >
          Back to List
        </Button>
        <Typography variant="h4" component="h1">
          {isEditMode ? 'Edit Vehicle' : 'Add New Vehicle'}
        </Typography>
      </Box>

      {/* ── Wizard card ─────────────────────────────────────────────────────── */}
      <Paper sx={{ p: 4, mb: 4 }}>
        <Stepper
          activeStep={activeStep}
          alternativeLabel
          connector={<GradientConnector />}
          sx={{ mb: 4 }}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box>
          {activeStep > 0 && !variantId ? (
            <Typography color="error">
              Please complete Basic Information first.
            </Typography>
          ) : (
            renderStepContent(activeStep)
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default CarFormLayout;
