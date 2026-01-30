import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, X, Github, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

const navLinks = [
  { name: "Features", href: "#features" },
  { name: "Compare", href: "#compare" },
  { name: "Docs", href: "#docs" },
];


export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<"google" | "apple" | null>(null);

  const handleOAuthSignIn = async (provider: "google" | "apple") => {
    setIsLoading(provider);
    try {
      const { error } = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: window.location.origin,
      });
      if (error) {
        toast.error(`Failed to sign in with ${provider}: ${error.message}`);
      }
    } catch (err) {
      toast.error(`An error occurred during ${provider} sign-in`);
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 glass"
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img src={logo} alt="Flow2Flow" className="w-10 h-10 object-contain" />
            <span className="text-xl font-bold gradient-text">Flow2Flow</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <Button variant="ghost" size="sm" className="gap-2" asChild>
              <a href="https://github.com/muhdfaisalwork-gif/flow2flow" target="_blank" rel="noopener noreferrer">
                <Github className="w-4 h-4" />
                <Star className="w-3 h-3" />
                Star on GitHub
              </a>
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleOAuthSignIn("google")}
              disabled={isLoading !== null}
            >
              {isLoading === "google" ? "Signing in..." : "Google"}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleOAuthSignIn("apple")}
              disabled={isLoading !== null}
            >
              {isLoading === "apple" ? "Signing in..." : "Apple"}
            </Button>
            <Link to="/dashboard">
              <Button size="sm" className="gradient-primary text-white border-0 glow-primary">
                Get Started Free
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 border-t border-border"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                <Button variant="outline" size="sm" className="gap-2 justify-center" asChild>
                  <a href="https://github.com/muhdfaisalwork-gif/flow2flow" target="_blank" rel="noopener noreferrer">
                    <Github className="w-4 h-4" />
                    <Star className="w-3 h-3" />
                    Star on GitHub
                  </a>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="justify-center"
                  onClick={() => handleOAuthSignIn("google")}
                  disabled={isLoading !== null}
                >
                  {isLoading === "google" ? "Signing in..." : "Sign in with Google"}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="justify-center"
                  onClick={() => handleOAuthSignIn("apple")}
                  disabled={isLoading !== null}
                >
                  {isLoading === "apple" ? "Signing in..." : "Sign in with Apple"}
                </Button>
                <Button size="sm" className="gradient-primary text-white border-0">
                  Get Started Free
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </nav>
    </motion.header>
  );
}
