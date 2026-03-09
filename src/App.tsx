import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ReceivingList from "./pages/ReceivingList";
import ReceivingForm from "./pages/ReceivingForm";
import CCPList from "./pages/CCPList";
import CCPForm from "./pages/CCPForm";
import NCRList from "./pages/NCRList";
import NCRForm from "./pages/NCRForm";
import CalibrationList from "./pages/CalibrationList";
import MoreModules from "./pages/MoreModules";
import EnvironmentList from "./pages/EnvironmentList";
import EnvironmentForm from "./pages/EnvironmentForm";
import AuditList from "./pages/AuditList";
import AuditForm from "./pages/AuditForm";
import ComplaintList from "./pages/ComplaintList";
import ComplaintForm from "./pages/ComplaintForm";
import TraceabilityPage from "./pages/TraceabilityPage";
import WaterQualityList from "./pages/WaterQualityList";
import WaterQualityForm from "./pages/WaterQualityForm";
import AllergenList from "./pages/AllergenList";
import AllergenForm from "./pages/AllergenForm";
import MetalDetectorList from "./pages/MetalDetectorList";
import MetalDetectorForm from "./pages/MetalDetectorForm";
import DeviationList from "./pages/DeviationList";
import InspectionLogList from "./pages/InspectionLogList";
import InspectionForm from "./pages/InspectionForm";
import SamplingPlanPage from "./pages/SamplingPlanPage";
import MasterDataPage from "./pages/MasterDataPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          {/* Receiving */}
          <Route path="/receiving" element={<ReceivingList />} />
          <Route path="/receiving/new" element={<ReceivingForm />} />
          {/* CCP */}
          <Route path="/ccp" element={<CCPList />} />
          <Route path="/ccp/new" element={<CCPForm />} />
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
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
