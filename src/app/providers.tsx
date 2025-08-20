"use client";
import { ConfigProvider, App as AntApp, theme } from "antd";
import { StyleProvider } from "@ant-design/cssinjs";
import { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <StyleProvider hashPriority="high">
      <ConfigProvider 
        theme={{ 
          algorithm: theme.defaultAlgorithm,
          token: {
            colorText: '#262626',
            colorTextSecondary: '#595959',
            colorTextTertiary: '#8c8c8c',
            colorBgContainer: '#ffffff',
            colorBgElevated: '#ffffff',
          }
        }}
      >
        <AntApp>{children}</AntApp>
      </ConfigProvider>
    </StyleProvider>
  );
}
