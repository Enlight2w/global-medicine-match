import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import ComplianceDirectory from "./pages/ComplianceDirectory";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import PatientAccess from "./pages/PatientAccess";
import Workspace from "./pages/Workspace";

function Router() { return <Switch><Route path="/" component={Home} /><Route path="/workspace" component={Workspace} /><Route path="/compliance" component={ComplianceDirectory} /><Route path="/patients" component={PatientAccess} /><Route path="/404" component={NotFound} /><Route component={NotFound} /></Switch>; }
export default function App() { return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster richColors position="top-right" /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>; }
