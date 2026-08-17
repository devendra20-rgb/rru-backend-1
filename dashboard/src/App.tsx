import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import BrandList from './pages/brands/BrandList';
import BrandForm from './pages/brands/BrandForm';
import ModelList from './pages/models/ModelList';
import ModelForm from './pages/models/ModelForm';
import GenerationList from './pages/generations/GenerationList';
import GenerationForm from './pages/generations/GenerationForm';
import FeatureList from './pages/features/FeatureList';
import FeatureForm from './pages/features/FeatureForm';
import ColorList from './pages/colors/ColorList';
import ColorForm from './pages/colors/ColorForm';
import MarketList from './pages/markets/MarketList';
import MarketForm from './pages/markets/MarketForm';
import CarList from './pages/cars/CarList';
import CarFormLayout from './pages/cars/CarFormLayout';
import CarDetail from './pages/cars/CarDetail';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Brands */}
          <Route path="/brands" element={<BrandList />} />
          <Route path="/brands/new" element={<BrandForm />} />
          <Route path="/brands/:id/edit" element={<BrandForm />} />

          {/* Models */}
          <Route path="/models" element={<ModelList />} />
          <Route path="/models/new" element={<ModelForm />} />
          <Route path="/models/:id/edit" element={<ModelForm />} />

          {/* Generations */}
          <Route path="/generations" element={<GenerationList />} />
          <Route path="/generations/new" element={<GenerationForm />} />
          <Route path="/generations/:id/edit" element={<GenerationForm />} />

          {/* Cars / Vehicles */}
          <Route path="/cars" element={<CarList />} />
          <Route path="/cars/new" element={<CarFormLayout />} />
          <Route path="/cars/:id" element={<CarDetail />} />
          <Route path="/cars/:id/edit" element={<CarFormLayout />} />

          {/* Master Data: Features */}
          <Route path="/features" element={<FeatureList />} />
          <Route path="/features/new" element={<FeatureForm />} />
          <Route path="/features/:id/edit" element={<FeatureForm />} />

          {/* Master Data: Colors */}
          <Route path="/colors" element={<ColorList />} />
          <Route path="/colors/new" element={<ColorForm />} />
          <Route path="/colors/:id/edit" element={<ColorForm />} />

          {/* Master Data: Markets */}
          <Route path="/markets" element={<MarketList />} />
          <Route path="/markets/new" element={<MarketForm />} />
          <Route path="/markets/:id/edit" element={<MarketForm />} />

          {/* Other routes will go here as they are built */}
        </Route>
        
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;







