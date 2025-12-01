'use client';

import { useResponsive } from '@/hooks/useResponsive';

interface MobileViewProps {
  children: React.ReactNode;
}

export const MobileView = ({ children }: MobileViewProps) => {
  const { isMobile } = useResponsive();

  if (!isMobile) return null;

  return <div className="block md:hidden">{children}</div>;
};