import React from 'react';
import { 
  Home, 
  Zap, 
  ShoppingBag, 
  Utensils, 
  PlayCircle, 
  Fuel, 
  Activity, 
  TrendingUp, 
  CreditCard, 
  Car, 
  Circle, 
  Folder,
  Wallet,
  PiggyBank,
  Banknote,
  ShoppingCart,
  HeartPulse,
  Smartphone,
  Wifi,
  Coffee,
  Globe
} from 'lucide-react';

/**
 * CategoryIconMap
 * Centralized mapping of semantic icon IDs to Lucide components.
 */
export const CATEGORY_ICON_MAP = {
  // Income
  'salary': TrendingUp,
  'bonus': Banknote,
  'income': Wallet,
  'trending-up': TrendingUp,
  
  // Housing & Utilities
  'home': Home,
  'rent': Home,
  'mortgage': Home,
  'zap': Zap,
  'utilities': Zap,
  'wifi': Wifi,
  'phone': Smartphone,
  
  // Lifestyle
  'shopping': ShoppingBag,
  'groceries': ShoppingCart,
  'utensils': Utensils,
  'dining': Coffee,
  'coffee': Coffee,
  'play': PlayCircle,
  'entertainment': PlayCircle,
  
  // Health & Care
  'activity': Activity,
  'healthcare': HeartPulse,
  'wellness': HeartPulse,
  
  // Transport
  'fuel': Fuel,
  'car': Car,
  'transport': Car,
  
  // Financial
  'credit-card': CreditCard,
  'debt': CreditCard,
  'loan': Car, // Usually car loan
  'savings': PiggyBank,
  'investment': Globe,
  
  // Fallbacks
  'circle': Circle,
  'folder': Folder
};

/**
 * getCategoryIcon
 * Helper to retrieve a Lucide component for a given ID.
 */
export const getCategoryIcon = (iconId) => {
  const id = (iconId || 'circle').toLowerCase();
  const IconComponent = CATEGORY_ICON_MAP[id] || Circle;
  return IconComponent;
};

/**
 * CategoryIcon
 * Reusable component for displaying categorized icons with WealthLens styling.
 */
export const CategoryIcon = ({ iconId, category, className = "w-4 h-4", colorClass = "text-slate-400" }) => {
  // Try to match by ID first, then by category name
  let id = iconId;
  
  if (!id && category) {
    const cat = category.toLowerCase();
    if (cat.includes('rent') || cat.includes('mortgage') || cat.includes('housing')) id = 'home';
    else if (cat.includes('electric') || cat.includes('utility') || cat.includes('power')) id = 'zap';
    else if (cat.includes('grocery') || cat.includes('food')) id = 'shopping';
    else if (cat.includes('eat') || cat.includes('dining') || cat.includes('restaurant')) id = 'utensils';
    else if (cat.includes('fun') || cat.includes('movie') || cat.includes('show')) id = 'play';
    else if (cat.includes('fuel') || cat.includes('gas') || cat.includes('petrol')) id = 'fuel';
    else if (cat.includes('health') || cat.includes('doctor') || cat.includes('med')) id = 'activity';
    else if (cat.includes('salary') || cat.includes('wage') || cat.includes('income')) id = 'salary';
    else if (cat.includes('card') || cat.includes('debt')) id = 'credit-card';
    else if (cat.includes('car') || cat.includes('auto')) id = 'car';
  }

  const Icon = getCategoryIcon(id);
  return <Icon className={`${className} ${colorClass}`} />;
};
