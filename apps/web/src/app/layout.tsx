import type { Metadata } from "next";
import { Geist, Geist_Mono, Cormorant_Garamond } from "next/font/google";
import { Toaster } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { CartProvider } from "@/components/cart-provider";
import { CartDrawer } from "@/components/cart-drawer";
import { WishlistProvider } from "@/components/wishlist-provider";
import { MotionProvider } from "@/components/motion-provider";
import { AnnouncementBanner } from "@/components/announcement-banner";
import { MaintenancePage } from "@/components/maintenance-page";
import { getCart } from "@/lib/cart";
import { isBackendReachable } from "@/lib/medusa";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const fontClassName = `${geistSans.variable} ${geistMono.variable} ${cormorant.variable}`;

export const metadata: Metadata = {
  title: "Maison Luxe",
  description:
    "Storefront headless de lujo: relojería, joyería, moda y tecnología premium.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const backendUp = await isBackendReachable();

  if (!backendUp) {
    return <MaintenancePage fontClassName={fontClassName} />;
  }

  const cart = await getCart();

  return (
    <html lang="es" className={`${fontClassName} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <MotionProvider>
          <WishlistProvider>
            <CartProvider initialCart={cart}>
              <AnnouncementBanner />
              <SiteHeader />
              <main className="flex-1">{children}</main>
              <CartDrawer />
              <Toaster position="bottom-center" richColors closeButton />
            </CartProvider>
          </WishlistProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
