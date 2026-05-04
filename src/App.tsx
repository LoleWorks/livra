import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { ThemeProvider } from './context/ThemeContext'
import Dashboard from './pages/Dashboard'
import RoutesPage from './pages/Routes'
import Drivers from './pages/Drivers'
import Warehouses from './pages/Warehouses'
import WarehouseDetail from './pages/WarehouseDetail'
import Credits from './pages/Credits'
import Integrations from './pages/Integrations'
import Track from './pages/Track'
import Activity from './pages/Activity'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import AppDownload from './pages/AppDownload'
import Login from './pages/Login'
import ChangePassword from './pages/ChangePassword'
import SalesLayout from './pages/sales/SalesLayout'
import SalesDashboard from './pages/sales/SalesDashboard'
import SalesOrders from './pages/sales/SalesOrders'
import SalesNewOrder from './pages/sales/SalesNewOrder'
import SalesReturns from './pages/sales/SalesReturns'
import IndustryPage from './pages/industrii/IndustryPage'
import UseCasePage from './pages/cazuri/UseCasePage'
import Onboarding from './pages/Onboarding'
import DriverDownload from './pages/DriverDownload'

export default function App() {
  return (
    <HelmetProvider>
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/app" element={<AppDownload />} />
          <Route path="/get/driver-android-b4f9e2" element={<DriverDownload />} />
          <Route path="/login" element={<Login />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/t/:token" element={<Track />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/urmarire/:token" element={<Track />} />
          <Route path="/industrii/:slug" element={<IndustryPage />} />
          <Route path="/cazuri/:slug" element={<UseCasePage />} />
          {/* Legacy redirects */}
          <Route path="/sales/login" element={<Navigate to="/login" replace />} />
          <Route path="/sales/change-password" element={<Navigate to="/change-password" replace />} />
          <Route element={<SalesLayout />}>
            <Route path="/sales" element={<SalesDashboard />} />
            <Route path="/sales/comenzi" element={<SalesOrders />} />
            <Route path="/sales/nou" element={<SalesNewOrder />} />
            <Route path="/sales/retururi" element={<SalesReturns />} />
          </Route>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/routes" element={<RoutesPage />} />
            <Route path="/drivers" element={<Drivers />} />
            <Route path="/warehouses" element={<Warehouses />} />
            <Route path="/warehouses/:id" element={<WarehouseDetail />} />
            <Route path="/activity" element={<Activity />} />
            <Route path="/integrations" element={<Integrations />} />
            <Route path="/credits" element={<Credits />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
    </HelmetProvider>
  )
}
