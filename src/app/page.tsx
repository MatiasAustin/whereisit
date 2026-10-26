'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/storefront/Navbar';
import Hero from '@/components/storefront/Hero';
import AboutSection from '@/components/storefront/AboutSection';
import FreshCollection from '@/components/storefront/FreshCollection';
import CustomDesignSection from '@/components/storefront/CustomDesignSection';
import CustomCharacterSection from '@/components/storefront/CustomCharacterSection';
import StudioCraft from '@/components/storefront/StudioCraft';
import ReviewsSection from '@/components/storefront/ReviewsSection';
import JournalSection from '@/components/storefront/JournalSection';
import DeliveryPaymentSection from '@/components/storefront/DeliveryPaymentSection';
import Footer from '@/components/storefront/Footer';
import ProductDetailModal from '@/components/storefront/ProductDetailModal';
import { Product, StoreSettings, ProductReview, JournalArticle } from '@/types';
import { INITIAL_PRODUCTS } from '@/lib/initialData';
import { INITIAL_SETTINGS, INITIAL_REVIEWS, INITIAL_JOURNAL } from '@/lib/studioDefaults';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [settings, setSettings] = useState<StoreSettings>(INITIAL_SETTINGS);
  const [reviews, setReviews] = useState<ProductReview[]>(INITIAL_REVIEWS);
  const [journal, setJournal] = useState<JournalArticle[]>(INITIAL_JOURNAL);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Load database-driven live data from APIs
  useEffect(() => {
    // 1. Products
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setProducts(data.data);
        }
      })
      .catch((err) => console.log('Products fallback loaded', err));

    // 2. Settings (announcement, payment, delivery, store profile)
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setSettings(data.data);
        }
      })
      .catch((err) => console.log('Settings fallback loaded', err));

    // 3. Reviews (approved client feedback)
    fetch('/api/reviews')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setReviews(data.data);
        }
      })
      .catch((err) => console.log('Reviews fallback loaded', err));

    // 4. Studio Journal
    fetch('/api/journal')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setJournal(data.data);
        }
      })
      .catch((err) => console.log('Journal fallback loaded', err));
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const featuredProduct = products.find((p) => p.featured) || products[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F6F1]">
      {/* Dynamic Navbar with Database Announcement Bar */}
      <Navbar storeSettings={settings} />

      <main className="flex-grow">
        {/* Dynamic Hero Section connected to database */}
        <Hero 
          onGoToCatalog={() => scrollToSection('catalog')}
          onGoToCustom={() => scrollToSection('custom-design')}
          featuredProduct={featuredProduct}
          storeSettings={settings}
          onSelectProduct={(p) => setSelectedProduct(p)}
        />

        {/* 01/ About us & Philosophy based on Image 1 + Image 2 */}
        <AboutSection />

        {/* Fresh Collection - Dark Contrast Section fed directly from database */}
        <FreshCollection
          products={products}
          onSelectProduct={(p) => setSelectedProduct(p)}
        />

        {/* Custom Design Consultation Flow (Submits to database) */}
        <CustomDesignSection />

        {/* Custom Character Keepsakes (Submits to database) */}
        <CustomCharacterSection />

        {/* Studio Craft & Technical Excellence */}
        <StudioCraft />

        {/* Live Client Reviews & Collector Testimonials from Database */}
        <ReviewsSection reviews={reviews} />

        {/* Studio Journal & Industrial Essays from Database */}
        <JournalSection articles={journal} />

        {/* Delivery & Payment Foundation configured from Database Settings */}
        <DeliveryPaymentSection storeSettings={settings} />
      </main>

      {/* Dynamic Footer with database contact info & live newsletter */}
      <Footer storeSettings={settings} />

      {/* Interactive Product Detail Dialog */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
