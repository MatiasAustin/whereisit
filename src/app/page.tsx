'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/storefront/Navbar';
import Hero from '@/components/storefront/Hero';
import AboutSection from '@/components/storefront/AboutSection';
import FreshCollection from '@/components/storefront/FreshCollection';
import CustomDesignSection from '@/components/storefront/CustomDesignSection';
import CustomCharacterSection from '@/components/storefront/CustomCharacterSection';
import StudioCraft from '@/components/storefront/StudioCraft';
import DeliveryPaymentSection from '@/components/storefront/DeliveryPaymentSection';
import Footer from '@/components/storefront/Footer';
import ProductDetailModal from '@/components/storefront/ProductDetailModal';
import { Product } from '@/types';
import { INITIAL_PRODUCTS } from '@/lib/initialData';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Fetch updated catalog on client
  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setProducts(data.data);
        }
      })
      .catch((err) => console.log('Using initial fallback products', err));
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F6F1]">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section based on Image 1 */}
        <Hero 
          onGoToCatalog={() => scrollToSection('catalog')}
          onGoToCustom={() => scrollToSection('custom-design')}
        />

        {/* 01/ About us & Philosophy based on Image 1 + Image 2 */}
        <AboutSection />

        {/* Fresh Collection - Dark Contrast Section based on Image 1 */}
        <FreshCollection
          products={products}
          onSelectProduct={(p) => setSelectedProduct(p)}
        />

        {/* Custom Design Consultation Flow */}
        <CustomDesignSection />

        {/* Custom Character Keepsakes (From photo to 3D chibi figurine) */}
        <CustomCharacterSection />

        {/* Studio Craft & Technical Excellence */}
        <StudioCraft />

        {/* Delivery & Payment Foundation */}
        <DeliveryPaymentSection />
      </main>

      <Footer />

      {/* Interactive Product Detail Dialog */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
