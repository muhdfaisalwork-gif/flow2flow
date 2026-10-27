// Shadow Flow App v3 - With Authentication & Error Boundaries
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { DemoProvider } from "@/contexts/DemoContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Pricing from "./pages/Pricing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import WorkflowEditor from "./pages/WorkflowEditor";
import SharedWorkflow from "./pages/SharedWorkflow";
import Settings from "./pages/Settings";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import SEOAgent from "./pages/SEOAgent";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Features from "./pages/Features";
import Integrations from "./pages/Integrations";
import Changelog from "./pages/Changelog";
import Roadmap from "./pages/Roadmap";
import Docs from "./pages/Docs";
import ApiReference from "./pages/ApiReference";
import Community from "./pages/Community";
import Tutorials from "./pages/Tutorials";
import About from "./pages/About";
import Careers from "./pages/Careers";
import Contact from "./pages/Contact";
import Partners from "./pages/Partners";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import CookiePolicy from "./pages/CookiePolicy";
import License from "./pages/License";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <AuthProvider>
        <TooltipProvider>
          <ErrorBoundary fallbackMessage="The application encountered an error. Please refresh the page.">
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/workflow/new"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary fallbackMessage="The workflow editor crashed. Your work has been auto-saved.">
                        <WorkflowEditor />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/workflow/:id"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary fallbackMessage="The workflow editor crashed. Your work has been auto-saved.">
                        <WorkflowEditor />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route path="/workflow/share/:token" element={<SharedWorkflow />} />
                {/* Demo routes - no auth required */}
                <Route
                  path="/demo"
                  element={
                    <DemoProvider>
                      <Dashboard />
                    </DemoProvider>
                  }
                />
                <Route
                  path="/demo/workflow/new"
                  element={
                    <DemoProvider>
                      <ErrorBoundary fallbackMessage="The workflow editor crashed.">
                        <WorkflowEditor />
                      </ErrorBoundary>
                    </DemoProvider>
                  }
                />
                <Route
                  path="/demo/workflow/:id"
                  element={
                    <DemoProvider>
                      <ErrorBoundary fallbackMessage="The workflow editor crashed.">
                        <WorkflowEditor />
                      </ErrorBoundary>
                    </DemoProvider>
                  }
                />
                <Route
                  path="/demo/settings"
                  element={
                    <DemoProvider>
                      <Settings />
                    </DemoProvider>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <DemoProvider>
                      <Settings />
                    </DemoProvider>
                  }
                />
                {/* Marketing & Public Hub Routes */}
                <Route path="/features" element={<Features />} />
                <Route path="/integrations" element={<Integrations />} />
                <Route path="/changelog" element={<Changelog />} />
                <Route path="/roadmap" element={<Roadmap />} />
                <Route path="/seo-agent" element={<SEOAgent />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/docs" element={<Docs />} />
                <Route path="/api-reference" element={<ApiReference />} />
                <Route path="/community" element={<Community />} />
                <Route path="/tutorials" element={<Tutorials />} />
                <Route path="/about" element={<About />} />
                <Route path="/careers" element={<Careers />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/partners" element={<Partners />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/cookies" element={<CookiePolicy />} />
                <Route path="/license" element={<License />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </ErrorBoundary>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
