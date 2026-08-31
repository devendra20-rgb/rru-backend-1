const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
    let content = fs.readFileSync(filePath, 'utf8');
    for (const { target, replacement } of replacements) {
        content = content.replace(target, replacement);
    }
    fs.writeFileSync(filePath, content, 'utf8');
}

const basePath = path.join(__dirname, 'src');

// 1. AdminTable.tsx
replaceInFile(path.join(basePath, 'components/common/AdminTable.tsx'), [
    { target: 'Button,\n  Select', replacement: 'Select' },
    { target: ' Button,\n', replacement: '\n' },
    { target: 'onPageChange={(e, newPage)', replacement: 'onPageChange={(_, newPage)' }
]);

// 2. AsyncSelect.tsx
replaceInFile(path.join(basePath, 'components/common/AsyncSelect.tsx'), [
    { target: 'onChange={(event, newValue) => {', replacement: 'onChange={(_, newValue) => {' },
    { target: 'onInputChange={(event, newInputValue) => {', replacement: 'onInputChange={(_, newInputValue) => {' },
    { target: 'const { InputProps, ...restParams } = params;', replacement: 'const { ...restParams } = params;' },
    { target: 'InputProps={{\n              ...params.InputProps,\n              endAdornment: (\n                <React.Fragment>\n                  {loading ? <CircularProgress color="inherit" size={20} /> : null}\n                  {params.InputProps.endAdornment}\n                </React.Fragment>\n              ),\n            }}', replacement: 'InputProps={{\n              ...(params as any).InputProps,\n              endAdornment: (\n                <React.Fragment>\n                  {loading ? <CircularProgress color="inherit" size={20} /> : null}\n                  {(params as any).InputProps?.endAdornment}\n                </React.Fragment>\n              ),\n            }}' }
]);

// 3. GlobalErrorBoundary.tsx
replaceInFile(path.join(basePath, 'components/common/GlobalErrorBoundary.tsx'), [
    { target: "import React, { Component, ErrorInfo, ReactNode } from 'react';", replacement: "import { Component } from 'react';\nimport type { ErrorInfo, ReactNode } from 'react';" },
    { target: '<Typography variant="body1" color="text.secondary" paragraph>', replacement: '<Typography variant="body1" color="text.secondary">' }
]);

// 4. GlobalToastProvider.tsx
replaceInFile(path.join(basePath, 'components/common/GlobalToastProvider.tsx'), [
    { target: 'const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {', replacement: 'const handleClose = (_?: React.SyntheticEvent | Event, reason?: string) => {' }
]);

// 5. BrandForm.tsx
replaceInFile(path.join(basePath, 'pages/brands/BrandForm.tsx'), [
    { target: 'const saveError = createMutation.error || updateMutation.error;', replacement: '' }
]);

// 6. Step2Specifications.tsx
replaceInFile(path.join(basePath, 'pages/cars/steps/Step2Specifications.tsx'), [
    { target: 'Alert,\n', replacement: '' },
    { target: "import AddIcon from '@mui/icons-material/Add';\n", replacement: '' },
    { target: 'const { fields: customFields, append: appendCustom, remove: removeCustom } = useFieldArray({', replacement: 'const { fields: customFields, remove: removeCustom } = useFieldArray({' }
]);

// 7. Step3Features.tsx
replaceInFile(path.join(basePath, 'pages/cars/steps/Step3Features.tsx'), [
    { target: 'CircularProgress, Alert, Paper', replacement: 'CircularProgress, Paper' }
]);

// 8. Step4Colors.tsx
replaceInFile(path.join(basePath, 'pages/cars/steps/Step4Colors.tsx'), [
    { target: 'CircularProgress, Alert, Paper', replacement: 'CircularProgress, Paper' }
]);

// 9. Step5Markets.tsx
replaceInFile(path.join(basePath, 'pages/cars/steps/Step5Markets.tsx'), [
    { target: 'CircularProgress, Alert, Paper', replacement: 'CircularProgress, Paper' }
]);

// 10. Step6Media.tsx
replaceInFile(path.join(basePath, 'pages/cars/steps/Step6Media.tsx'), [
    { target: 'CircularProgress, Alert, Paper', replacement: 'CircularProgress, Paper' }
]);

// 11. ColorForm.tsx
replaceInFile(path.join(basePath, 'pages/colors/ColorForm.tsx'), [
    { target: 'const saveError = createMutation.error || updateMutation.error;', replacement: '' }
]);

// 12. CustomAttributeForm.tsx
replaceInFile(path.join(basePath, 'pages/custom-attributes/CustomAttributeForm.tsx'), [
    { target: 'TextField, Grid, FormControl', replacement: 'TextField, FormControl' },
    { target: 'Switch, FormControlLabel, FormHelperText, Typography', replacement: 'Switch, FormControlLabel, Typography' },
    { target: "import { useForm, Controller, useFieldArray } from 'react-hook-form';\n", replacement: '' }
]);

// 13. FeatureForm.tsx
replaceInFile(path.join(basePath, 'pages/features/FeatureForm.tsx'), [
    { target: 'const saveError = createMutation.error || updateMutation.error;', replacement: '' }
]);

// 14. FileManager.tsx
replaceInFile(path.join(basePath, 'pages/file-manager/FileManager.tsx'), [
    { target: "import { useNavigate, useSearchParams } from 'react-router-dom';", replacement: "import { useSearchParams } from 'react-router-dom';" }
]);

// 15. GenerationForm.tsx
replaceInFile(path.join(basePath, 'pages/generations/GenerationForm.tsx'), [
    { target: 'const saveError = createMutation.error || updateMutation.error;', replacement: '' }
]);

// 16. MarketForm.tsx
replaceInFile(path.join(basePath, 'pages/markets/MarketForm.tsx'), [
    { target: 'const saveError = createMutation.error || updateMutation.error;', replacement: '' }
]);

// 17. ModelForm.tsx
replaceInFile(path.join(basePath, 'pages/models/ModelForm.tsx'), [
    { target: 'const saveError = createMutation.error || updateMutation.error;', replacement: '' }
]);

// 18. Settings.tsx
replaceInFile(path.join(basePath, 'pages/settings/Settings.tsx'), [
    { target: 'Paper, Grid, TextField', replacement: 'Paper, TextField' }
]);

console.log('Fixed files');
