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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/receiving" element={<ReceivingList />} />
          <Route path="/receiving/new" element={<ReceivingForm />} />
          <Route path="/ccp" element={<CCPList />} />
          <Route path="/ccp/new" element={<CCPForm />} />
          <Route path="/ncr" element={<NCRList />} />
          <Route path="/ncr/new" element={<NCRForm />} />
          <Route path="/calibration" element={<CalibrationList />} />
          <Route path="/more" element={<MoreModules />} />
          <Route path="/environment" element={<EnvironmentList />} />
          <Route path="/environment/new" element={<EnvironmentForm />} />
          <Route path="/audit" element={<AuditList />} />
          <Route path="/audit/new" element={<AuditForm />} />
          <Route path="/complaints" element={<ComplaintList />} />
          <Route path="/complaints/new" element={<ComplaintForm />} />
          <Route path="/traceability" element={<TraceabilityPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
