"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EncryptButton } from "./ui/encrypt-button";
import { useAuth } from "@/contexts/AuthContext";
import { LoginModal } from "./LoginModal";
import { WalletDisplay } from "./WalletDisplay";

export function Navbar() {
  const [activeLink, setActiveLink] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const router = useRouter();
  const { isAuthenticated, account, logout } = useAuth();

  const links = [
    { name: "Upload", path: "/upload" },
    { name: "Chat", path: "/chat" },
    { name: "Dashboard", path: "/dashboard" },
    { name: "Docs", path: "/docs" },
  ];

  const handleLinkClick = (link: { name: string; path: string }) => {
    // Require authentication for certain routes
    const protectedRoutes = ["/upload", "/chat", "/dashboard"];

    if (protectedRoutes.includes(link.path) && !isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    setActiveLink(link.name);
    router.push(link.path);
  };

  const handleLoginClick = () => {
    if (isAuthenticated) {
      // Show user menu or logout
      logout();
    } else {
      setShowLoginModal(true);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="shrink-0">
            <button onClick={() => router.push('/')} className="text-2xl font-bold bg-linear-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent cursor-pointer">
              Storarc
            </button>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {links.map((link) => (
              <EncryptButton
                key={link.name}
                onClick={() => handleLinkClick(link)}
                className={`px-4 py-2 transition-colors ${
                  activeLink === link.name
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.name}
              </EncryptButton>
            ))}
          </div>

          {/* Login/Logout Button */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && account && (
              <>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-accent text-sm">
                  {account.picture && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={account.picture}
                      alt="Profile"
                      className="w-6 h-6 rounded-full"
                    />
                  )}
                  <span className="text-muted-foreground">
                    {account.email || account.name || 'User'}
                  </span>
                </div>
                <WalletDisplay />
              </>
            )}
            <button
              onClick={handleLoginClick}
              className="px-6 py-2 rounded-full bg-linear-to-r from-blue-500 to-purple-600 text-white font-medium hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300"
            >
              {isAuthenticated ? 'Logout' : 'Login'}
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </nav>
  );
}
