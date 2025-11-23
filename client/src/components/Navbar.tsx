"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ConnectButton } from "@mysten/dapp-kit";
import { EncryptButton } from "./ui/encrypt-button";
import Image from "next/image";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const links = [
    { name: "Upload", path: "/upload" },
    { name: "Chat", path: "/chat" },
    { name: "Documents", path: "/documents" },
    { name: "Dashboard", path: "/dashboard" },
    { name: "Docs", path: "/docs" },
  ];

  const handleLinkClick = (path: string) => {
    router.push(path);
    setMobileMenuOpen(false);
  };

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="shrink-0">
            <button
              onClick={() => handleLinkClick('/')}
              className="flex items-center hover:opacity-80 transition-opacity cursor-pointer"
              aria-label="Go to homepage"
            >
              <Image
                src="/storarc-removebg-preview.png"
                alt="Storarc Logo"
                width={180}
                height={100}
                priority
                className="h-32 w-auto"
              />
            </button>
          </div>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center space-x-1">
            {links.map((link) => (
              <EncryptButton
                key={link.name}
                onClick={() => handleLinkClick(link.path)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isActive(link.path)
                    ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                {link.name}
              </EncryptButton>
            ))}
          </div>

          {/* Wallet Connection - Desktop */}
          <div className="hidden md:flex items-center gap-3">
            <ConnectButton />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <ConnectButton />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4">
            <div className="flex flex-col space-y-2">
              {links.map((link) => (
                <button
                  key={link.name}
                  onClick={() => handleLinkClick(link.path)}
                  className={`px-4 py-3 rounded-lg transition-colors text-left ${
                    isActive(link.path)
                      ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  {link.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
