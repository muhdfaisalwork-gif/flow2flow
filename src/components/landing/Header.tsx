import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, X, Github, Star, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navLinks = [
  { name: "Features", href: "/features" },
  { name: "Integrations", href: "/integrations" },
  { name: "Pricing", href: "/pricing" },
  { name: "Docs", href: "/docs" },
  { name: "Blog", href: "/blog" },
  { name: "AI SEO", href: "/seo-agent" },
];


export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<"google" | "apple" | null>(null);
  const { user, signOut } = useAuth();

  const handleOAuthSignIn = async (provider: "google" | "apple") => {
    setIsLoading(provider);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin,
        },
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

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
  };

  const displayName = user?.user_metadata?.display_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const initials = displayName.slice(0, 2).toUpperCase();

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
          <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <img src={logo} alt="Shadow Flow" className="w-10 h-10 object-contain" />
            <span className="text-xl font-bold gradient-text">Shadow Flow</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) =>
              link.href.startsWith("/") ? (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.name}
                </Link>
              ) : (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.name}
                </a>
              )
            )}
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
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                    </Avatar>
                    <span className="max-w-[120px] truncate">{displayName}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
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
              </>
            )}
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
              {navLinks.map((link) =>
                link.href.startsWith("/") ? (
                  <Link
                    key={link.name}
                    to={link.href}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ) : (
                  <a
                    key={link.name}
                    href={link.href}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.name}
                  </a>
                )
              )}
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                <Button variant="outline" size="sm" className="gap-2 justify-center" asChild>
                  <a href="https://github.com/muhdfaisalwork-gif/flow2flow" target="_blank" rel="noopener noreferrer">
                    <Github className="w-4 h-4" />
                    <Star className="w-3 h-3" />
                    Star on GitHub
                  </a>
                </Button>
                {user ? (
                  <>
                    <div className="flex items-center gap-2 py-2 px-3 bg-muted rounded-md">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium truncate">{displayName}</span>
                    </div>
                    <Button size="sm" className="gradient-primary text-white border-0" asChild>
                      <Link to="/dashboard">Go to Dashboard</Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="justify-center text-destructive"
                      onClick={handleSignOut}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
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
                    <Button size="sm" className="gradient-primary text-white border-0" asChild>
                      <Link to="/dashboard">Get Started Free</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </nav>
    </motion.header>
  );
}
