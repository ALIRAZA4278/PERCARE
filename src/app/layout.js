import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";

// Matches the reference site: Inter, weights 300–800.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "PetCare — Pakistan's Trusted Pet Ecosystem",
  description:
    "Discover veterinarians, shop pet products, adopt from shelters, and manage your pet's health. Pakistan's trusted pet care platform.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
