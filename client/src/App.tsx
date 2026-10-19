import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import AdminApprovals from "./pages/AdminApprovals";
import ComplianceAssistant from "./pages/ComplianceAssistant";
import ComplianceDirectory from "./pages/ComplianceDirectory";
import CoverageMapPage from "./pages/CoverageMapPage";
import Home from "./pages/Home";
import InventoryFeeds from "./pages/InventoryFeeds";
import LegalNotice from "./pages/LegalNotice";
import KnowledgeHub from "./pages/KnowledgeHub";
import MedicineSearch from "./pages/MedicineSearch";
import NotFound from "./pages/NotFound";
import PartnerDashboard from "./pages/PartnerDashboard";
import PatientAccess from "./pages/PatientAccess";
import Workspace from "./pages/Workspace";

function Router() { return <Switch><Route path="/" component={Home} /><Route path="/workspace" component={Workspace} /><Route path="/coverage" component={CoverageMapPage} /><Route path="/find-medicine" component={MedicineSearch} /><Route path="/partner-dashboard" component={PartnerDashboard} /><Route path="/ai-compliance" component={ComplianceAssistant} /><Route path="/inventory-feeds" component={InventoryFeeds} /><Route path="/admin-approvals" component={AdminApprovals} /><Route path="/compliance" component={ComplianceDirectory} /><Route path="/directory" component={ComplianceDirectory} /><Route path="/patients" component={PatientAccess} /><Route path="/legal" component={LegalNotice} /><Route path="/knowledge" component={KnowledgeHub} /><Route path="/404" component={NotFound} /><Route component={NotFound} /></Switch>; }
export default function App() { return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster richColors position="top-right" /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>; }
