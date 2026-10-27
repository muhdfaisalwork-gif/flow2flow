import { Link } from "react-router-dom";
import { Github, Twitter, MessageCircle } from "lucide-react";
import logo from "@/assets/logo.png";

interface FooterLinkItem {
  name: string;
  href: string;
  isExternal?: boolean;
}

const footerLinks: Record<string, FooterLinkItem[]> = {
  Product: [
    { name: "Features", href: "/features" },
    { name: "Integrations", href: "/integrations" },
    { name: "Pricing", href: "/pricing" },
    { name: "Changelog", href: "/changelog" },
    { name: "Roadmap", href: "/roadmap" },
    { name: "AI SEO Studio", href: "/seo-agent" },
  ],
  Resources: [
    { name: "Documentation", href: "/docs" },
    { name: "API Reference", href: "/api-reference" },
    { name: "Community", href: "/community" },
    { name: "Blog", href: "/blog" },
    { name: "Tutorials", href: "/tutorials" },
  ],
  Company: [
    { name: "About", href: "/about" },
    { name: "Careers", href: "/careers" },
    { name: "Contact", href: "/contact" },
    { name: "Partners", href: "/partners" },
  ],
  Legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Cookie Policy", href: "/cookies" },
    { name: "License", href: "/license" },
  ],
};

const socialLinks = [
  { name: "GitHub", icon: Github, href: "https://github.com/muhdfaisalwork-gif/shadowflow" },
  { name: "Twitter", icon: Twitter, href: "https://twitter.com" },
  { name: "Discord", icon: MessageCircle, href: "https://discord.com" },
];

export function Footer() {
  return (
    <footer className="py-16 border-t border-border bg-card/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4 group inline-flex">
              <img src={logo} alt="Shadow Flow" className="w-8 h-8 object-contain" />
              <span className="text-xl font-bold gradient-text">Shadow Flow</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs">
              The open-source workflow automation platform. Build, automate, and scale
              your operations with AI-powered tools.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold mb-4 text-foreground">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    {link.isExternal ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.name}
                      </a>
                    ) : (
                      <Link
                        to={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-16 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Shadow Flow. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Made with ❤️ by the open-source community
          </p>
        </div>
      </div>
    </footer>
  );
}
