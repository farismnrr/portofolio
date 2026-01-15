import { Footer, Header, RouteGuard } from "@/components";
import { Flex } from "@once-ui-system/core";

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Flex fillWidth minHeight="16" s={{ hide: true }} />
      <Header />
      <Flex zIndex={0} fillWidth padding="l" horizontal="center" flex={1}>
        <Flex horizontal="center" fillWidth minHeight="0">
          <RouteGuard>{children}</RouteGuard>
        </Flex>
      </Flex>
      <Footer />
    </>
  );
}
