'use client';

import { useResponsive } from '@/hooks/useResponsive';

interface WebViewProps {
  children: React.ReactNode;
}

export const WebView = ({ children }: WebViewProps) => {
  const { isMobile } = useResponsive();

  if (isMobile) return null;

  return <div className="hidden md:block">{children}</div>;
};