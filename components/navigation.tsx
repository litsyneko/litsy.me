"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, X, Github, Mail } from "lucide-react"
import { FaXTwitter } from "react-icons/fa6"
import { motion, AnimatePresence } from "framer-motion"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const navItems = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Projects", href: "/projects" },
    { name: "Contact", href: "/contact" },
  ]

  const isActive = (href: string) => pathname === href

  // 모바일 메뉴 닫기 (pathname 변경 시)
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <div className="w-full px-4 bg-background/90 backdrop-blur-xl border-b border-primary/20">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-16">
          <motion.div 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href="/"
              className="text-xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent"
            >
              Litsy.me
            </Link>
          </motion.div>

          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  delay: index * 0.1 + 0.3, 
                  duration: 0.4,
                  ease: "easeOut"
                }}
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
              >
                <Link
                  href={item.href}
                  className={`relative px-3 py-2 text-sm font-medium transition-all duration-300 rounded-lg group hover:bg-muted/50 dark:hover:bg-muted/20 ${
                    isActive(item.href) ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.name}
                  {isActive(item.href) && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary rounded-full"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                  {!isActive(item.href) && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-muted-foreground/60 dark:bg-muted-foreground/40 rounded-full group-hover:w-6 transition-all duration-300 ease-out" />
                  )}
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-2">
            <ThemeToggle />
            <motion.a
              href="https://github.com/litsyme"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="p-2.5 text-muted-foreground hover:text-foreground transition-all duration-300 hover:bg-muted/30 dark:hover:bg-muted/20 rounded-xl hover:shadow-sm"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5" />
            </motion.a>
            <motion.a
              href="https://x.com/litsyme"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="p-2.5 text-muted-foreground hover:text-foreground transition-all duration-300 hover:bg-muted/30 dark:hover:bg-muted/20 rounded-xl hover:shadow-sm"
              aria-label="Twitter"
            >
              <FaXTwitter className="w-5 h-5" />
            </motion.a>
            <motion.a
              href="mailto:litsy.dev@gmail.com"
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="p-2.5 text-muted-foreground hover:text-foreground transition-all duration-300 hover:bg-muted/30 dark:hover:bg-muted/20 rounded-xl hover:shadow-sm"
              aria-label="Email"
            >
              <Mail className="w-5 h-5" />
            </motion.a>
          </div>

          <motion.div 
            whileHover={{ scale: 1.02 }} 
            whileTap={{ scale: 0.98 }} 
            className="md:hidden"
          >
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? "Close menu" : "Open menu"}
            >
              <AnimatePresence mode="wait" initial={false}>
                {isOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -45, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 45, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <X className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 45, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -45, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Menu className="w-5 h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="md:hidden overflow-hidden border-t border-primary/20"
            >
              <div className="py-4 space-y-3">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.2 }}
                  >
                    <Link
                      href={item.href}
                      className={`block text-sm font-medium transition-all duration-300 px-3 py-2 rounded-lg hover:bg-muted/40 dark:hover:bg-muted/25 hover:translate-x-1 ${
                        isActive(item.href) ? "text-primary bg-muted/40 dark:bg-muted/25" : "text-muted-foreground hover:text-foreground"
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                ))}

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.2 }}
                  className="flex items-center space-x-3 px-2 pt-3 border-t border-primary/20"
                >
                  <ThemeToggle />
                  <a
                    href="https://github.com/litsyme"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 text-muted-foreground hover:text-foreground transition-all duration-300 hover:bg-muted/40 dark:hover:bg-muted/25 rounded-xl hover:scale-110 hover:-translate-y-0.5"
                    aria-label="GitHub"
                  >
                    <Github className="w-5 h-5" />
                  </a>
                  <a
                    href="https://x.com/litsyme"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 text-muted-foreground hover:text-foreground transition-all duration-300 hover:bg-muted/40 dark:hover:bg-muted/25 rounded-xl hover:scale-110 hover:-translate-y-0.5"
                    aria-label="Twitter"
                  >
                    <FaXTwitter className="w-5 h-5" />
                  </a>
                  <a
                    href="mailto:litsy.dev@gmail.com"
                    className="p-2.5 text-muted-foreground hover:text-foreground transition-all duration-300 hover:bg-muted/40 dark:hover:bg-muted/25 rounded-xl hover:scale-110 hover:-translate-y-0.5"
                    aria-label="Email"
                  >
                    <Mail className="w-5 h-5" />
                  </a>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  )
}