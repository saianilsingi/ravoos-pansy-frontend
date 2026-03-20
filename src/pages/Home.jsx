import { useEffect, useState } from "react";
import api from "../api/axios";
import HeroSection from "../components/home/HeroSection";
import CategoryGrid from "../components/home/CategoryGrid";
import ProductSection from "../components/home/ProductSection";
import OfferBanner from "../components/home/OfferBanner";

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [gamingItems, setGamingItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Ravoos Pansy";
  }, []);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [allRes, foodRes, gamingRes] = await Promise.all([
          api.get("products/"),
          api.get("products/?category=food"),
          api.get("products/?category=gaming"),
        ]);

        const all = Array.isArray(allRes.data) ? allRes.data : allRes.data.results || [];
        setFeatured(all.slice(0, 8));
        setFoodItems((Array.isArray(foodRes.data) ? foodRes.data : foodRes.data.results || []).slice(0, 4));
        setGamingItems((Array.isArray(gamingRes.data) ? gamingRes.data : gamingRes.data.results || []).slice(0, 4));
      } catch {
        // Silently fail — sections just won't render
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  return (
    <div className="space-y-20 pb-10">
      <HeroSection />
      <CategoryGrid />
      <ProductSection title="Featured Products" products={featured} link="/items" loading={loading} scrollable />
      <ProductSection title="Food Picks" products={foodItems} link="/items?category=food" loading={loading} scrollable />
      <ProductSection title="Gaming Essentials" products={gamingItems} link="/items?category=gaming" loading={loading} scrollable />
      <OfferBanner />
    </div>
  );
}
