import { User } from "@supabase/supabase-js"

export interface NavbarProps {
  currentUser: User | null
  isScrolled: boolean
  isAuthPage: boolean
  handleLogout: () => Promise<void>
  mounted: boolean
}

export interface MobileNavProps extends NavbarProps {
  isMobileMenuOpen: boolean
  setIsMobileMenuOpen: (open: boolean) => void
}
