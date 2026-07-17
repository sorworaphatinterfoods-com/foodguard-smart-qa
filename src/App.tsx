import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ReceivingList = lazy(() => import("./pages/ReceivingList"));
const ReceivingForm = lazy(() => import("./pages/ReceivingForm"));
const CCPList = lazy(() => import("./pages/CCPList"));
const CCPForm = lazy(() => import("./pages/CCPForm"));
const NCRList = lazy(() => import("./pages/NCRList"));
const NCRForm = lazy(() => import("./pages/NCRForm"));
const CalibrationList = lazy(() => import("./pages/CalibrationList"));
const MoreModules = lazy(() => import("./pages/MoreModules"));
const EnvironmentList = lazy(() => import("./pages/EnvironmentList"));
const EnvironmentForm = lazy(() => import("./pages/EnvironmentForm"));
const AuditList = lazy(() => import("./pages/AuditList"));
const AuditForm = lazy(() => import("./pages/AuditForm"));
const ComplaintList = lazy(() => import("./pages/ComplaintList"));
const ComplaintForm = lazy(() => import("./pages/ComplaintForm"));
const TraceabilityPage = lazy(() => import("./pages/TraceabilityPage"));
const WaterQualityList = lazy(() => import("./pages/WaterQualityList"));
const WaterQualityForm = lazy(() => import("./pages/WaterQualityForm"));
const AllergenList = lazy(() => import("./pages/AllergenList"));
const AllergenForm = lazy(() => import("./pages/AllergenForm"));
const MetalDetectorList = lazy(() => import("./pages/MetalDetectorList"));
const MetalDetectorForm = lazy(() => import("./pages/MetalDetectorForm"));
const DeviationList = lazy(() => import("./pages/DeviationList"));
const InspectionLogList = lazy(() => import("./pages/InspectionLogList"));
const InspectionForm = lazy(() => import("./pages/InspectionForm"));
const SamplingPlanPage = lazy(() => import("./pages/SamplingPlanPage"));
const MasterDataPage = lazy(() => import("./pages/MasterDataPage"));
const CcpDashboard = lazy(() => import("./pages/ccp/CcpDashboard"));
const MetalDetectorNewTest = lazy(() => import("./pages/ccp/MetalDetectorNewTest"));
const MetalDetectorTestRecords = lazy(() => import("./pages/ccp/MetalDetectorTestRecords"));
const CcpDeviations = lazy(() => import("./pages/ccp/CcpDeviations"));
const CcpHoldProducts = lazy(() => import("./pages/ccp/CcpHoldProducts"));
const CcpVerification = lazy(() => import("./pages/ccp/CcpVerification"));
const ThermalDashboard = lazy(() => import("./pages/ccp/ThermalDashboard"));
const ThermalNewReading = lazy(() => import("./pages/ccp/ThermalNewReading"));
const ThermalRecords = lazy(() => import("./pages/ccp/ThermalRecords"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Suspense fallback={null}>
          <Routes>
          <Route path="/" element={<Index />} />
          {/* Receiving */}
          <Route path="/receiving" element={<ReceivingList />} />
          <Route path="/receiving/new" element={<ReceivingForm />} />
          {/* CCP */}
          <Route path="/ccp" element={<CCPList />} />
          <Route path="/ccp/new" element={<CCPForm />} />
          {/* HACCP CCP + Metal Detector Monitoring */}
          <Route path="/ccp/dashboard" element={<CcpDashboard />} />
          <Route path="/ccp/metal-detector/new-test" element={<MetalDetectorNewTest />} />
          <Route path="/ccp/metal-detector/test-records" element={<MetalDetectorTestRecords />} />
          <Route path="/ccp/deviations" element={<CcpDeviations />} />
          <Route path="/ccp/hold-products" element={<CcpHoldProducts />} />
          <Route path="/ccp/verification" element={<CcpVerification />} />
          {/* HACCP CCP — Thermal (cooking / freezing) */}
          <Route path="/ccp/thermal" element={<ThermalDashboard />} />
          <Route path="/ccp/thermal/new" element={<ThermalNewReading />} />
          <Route path="/ccp/thermal/records" element={<ThermalRecords />} />
          {/* NCR/CAPA */}
          <Route path="/ncr" element={<NCRList />} />
          <Route path="/ncr/new" element={<NCRForm />} />
          {/* Inspection Log */}
          <Route path="/inspection" element={<InspectionLogList />} />
          <Route path="/inspection/new" element={<InspectionForm />} />
          {/* Environmental / GMP */}
          <Route path="/environment" element={<EnvironmentList />} />
          <Route path="/environment/new" element={<EnvironmentForm />} />
          {/* Water Quality */}
          <Route path="/water" element={<WaterQualityList />} />
          <Route path="/water/new" element={<WaterQualityForm />} />
          {/* Allergen */}
          <Route path="/allergen" element={<AllergenList />} />
          <Route path="/allergen/new" element={<AllergenForm />} />
          {/* Metal Detector */}
          <Route path="/metal-detector" element={<MetalDetectorList />} />
          <Route path="/metal-detector/new" element={<MetalDetectorForm />} />
          {/* Deviations & CAPA */}
          <Route path="/deviations" element={<DeviationList />} />
          {/* Calibration */}
          <Route path="/calibration" element={<CalibrationList />} />
          {/* Audit */}
          <Route path="/audit" element={<AuditList />} />
          <Route path="/audit/new" element={<AuditForm />} />
          {/* Complaints */}
          <Route path="/complaints" element={<ComplaintList />} />
          <Route path="/complaints/new" element={<ComplaintForm />} />
          {/* Traceability */}
          <Route path="/traceability" element={<TraceabilityPage />} />
          {/* Sampling Plan */}
          <Route path="/sampling" element={<SamplingPlanPage />} />
          {/* Master Data */}
          <Route path="/master-data" element={<MasterDataPage />} />
          {/* More */}
          <Route path="/more" element={<MoreModules />} />
          <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
