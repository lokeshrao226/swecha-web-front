
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, LogOut, Grid3X3, Calendar, User, FileText } from 'lucide-react';
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  title: string;
  description: string;
  published: boolean;
  rank: number;
  created_at: string;
  updated_at: string;
}

interface CategoriesProps {
  token: string;
  onBack: () => void;
  onLogout: () => void;
}

const Categories: React.FC<CategoriesProps> = ({ token, onBack, onLogout }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('https://backend2.swecha.org/api/v1/categories/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Categories Response:', data);
        // Filter only published categories and sort by rank
        const publishedCategories = data
          .filter((cat: Category) => cat.published)
          .sort((a: Category, b: Category) => a.rank - b.rank);
        setCategories(publishedCategories);
      } else {
        toast.error("Failed to fetch categories");
      }
    } catch (error) {
      console.error('Categories Error:', error);
      toast.error("Network error. Please try again.");
    }
    setLoading(false);
  };

  const getCategoryIcon = (name: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'fables': '📚',
      'events': '🎉',
      'music': '🎵',
      'places': '🏛️',
      'food': '🍽️',
      'people': '👥',
      'literature': '📖',
      'architecture': '🏗️',
      'skills': '⚡',
      'images': '🖼️',
      'culture': '🎭',
      'flora_&_fauna': '🌿',
      'education': '🎓',
      'vegetation': '🌱',
      'folk_songs': '🎶',
      'traditional_skills': '🛠️',
      'local_cultural_history': '🏛️',
      'local_history': '📜',
      'food_agriculture': '🌾',
      'old_newspapers': '📰',
      'folk tales': '📓'
    };
    return iconMap[name] || '📂';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="gradient-purple text-white p-6 rounded-b-3xl shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 w-10 h-10 rounded-full"
              onClick={onBack}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold mb-1">Categories</h1>
              <p className="text-purple-100 text-lg">Explore content categories</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 w-10 h-10 rounded-full"
            onClick={onLogout}
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="px-6 -mt-4 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          {categories.map((category) => (
            <Card key={category.id} className="animate-scale-in shadow-lg border-0 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">
                    {getCategoryIcon(category.name)}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg font-bold text-gray-800 mb-1">
                      {category.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-xs text-purple-600">
                      <Grid3X3 className="h-3 w-3" />
                      <span>Rank {category.rank}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {category.description}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(category.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    <span>{category.name}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📂</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Categories Found</h3>
            <p className="text-gray-600">Categories will appear here once they are available.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;
