import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ChefHat, Star, Trash2, Calendar, Loader2 } from 'lucide-react';
import { supabase } from '@/db/supabase';
import { useAuth } from '@/context/AuthContext';

interface Recipe {
  id: string;
  ingredients: string[];
  seasonings: Array<{ name: string; amount: string }>;
  cooking_method: string;
  evaluation: string;
  rating: number;
  image_url: string | null;
  created_at: string;
}

export default function History() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecipes(data || []);
    } catch (error: any) {
      console.error('加载历史记录失败:', error);
      toast.error('加载历史记录失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这条记录吗？')) return;

    try {
      setDeletingId(id);
      const { error } = await supabase.from('recipes').delete().eq('id', id);

      if (error) throw error;

      toast.success('删除成功');
      setRecipes(recipes.filter((r) => r.id !== id));
      if (selectedRecipe?.id === id) {
        setIsDialogOpen(false);
        setSelectedRecipe(null);
      }
    } catch (error: any) {
      console.error('删除失败:', error);
      toast.error('删除失败');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 标题 */}
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-3">
            <ChefHat className="w-10 h-10 text-primary" />
            我的食谱历史
          </h1>
          <p className="text-muted-foreground text-lg">查看你的美食创意记录</p>
        </div>

        {/* 历史记录列表 */}
        {recipes.length === 0 ? (
          <Card className="shadow-[var(--shadow-elegant)]">
            <CardContent className="py-20">
              <div className="text-center space-y-4">
                <ChefHat className="w-20 h-20 mx-auto text-muted-foreground opacity-50" />
                <p className="text-muted-foreground text-lg">还没有任何食谱记录</p>
                <p className="text-muted-foreground">快去创建你的第一个美食创意吧！</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <Card
                key={recipe.id}
                className="shadow-[var(--shadow-elegant)] hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => {
                  setSelectedRecipe(recipe);
                  setIsDialogOpen(true);
                }}
              >
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span className="truncate">{recipe.cooking_method}菜品</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= recipe.rating
                              ? 'fill-[#FF8C42] text-[#FF8C42]'
                              : 'text-muted-foreground'
                          }`}
                        />
                      ))}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recipe.image_url && (
                    <div className="rounded-lg overflow-hidden">
                      <img
                        src={recipe.image_url}
                        alt="菜品图片"
                        className="w-full h-40 object-cover"
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium text-foreground">食材：</span>
                      <span className="text-muted-foreground">
                        {recipe.ingredients.slice(0, 3).join('、')}
                        {recipe.ingredients.length > 3 && '...'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {formatDate(recipe.created_at)}
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(recipe.id);
                    }}
                    disabled={deletingId === recipe.id}
                  >
                    {deletingId === recipe.id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        删除中...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        删除
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* 详情对话框 */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">食谱详情</DialogTitle>
            </DialogHeader>
            {selectedRecipe && (
              <div className="space-y-6">
                {/* 星级评分 */}
                <div className="flex items-center justify-center gap-2 p-4 bg-muted rounded-lg">
                  <span className="text-lg font-medium">综合评分：</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-6 h-6 ${
                          star <= selectedRecipe.rating
                            ? 'fill-[#FF8C42] text-[#FF8C42]'
                            : 'text-muted-foreground'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-bold text-primary">{selectedRecipe.rating} 星</span>
                </div>

                {/* 配方信息 */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-lg mb-2">食材</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedRecipe.ingredients.map((item, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-muted rounded-full text-sm"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-lg mb-2">佐料</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedRecipe.seasonings.map((item, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-muted rounded-full text-sm"
                        >
                          {item.name} {item.amount}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-lg mb-2">烹饪方式</h3>
                    <span className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-full">
                      {selectedRecipe.cooking_method}
                    </span>
                  </div>
                </div>

                {/* AI评价 */}
                <div>
                  <h3 className="font-bold text-lg mb-2">AI 评价</h3>
                  <div className="p-4 bg-muted rounded-lg text-sm leading-relaxed whitespace-pre-wrap">
                    {selectedRecipe.evaluation}
                  </div>
                </div>

                {/* 成品图片 */}
                {selectedRecipe.image_url && (
                  <div>
                    <h3 className="font-bold text-lg mb-2">菜品效果图</h3>
                    <div className="rounded-lg overflow-hidden">
                      <img
                        src={selectedRecipe.image_url}
                        alt="菜品效果图"
                        className="w-full h-auto"
                      />
                    </div>
                  </div>
                )}

                {/* 创建时间 */}
                <div className="text-center text-sm text-muted-foreground">
                  创建时间：{formatDate(selectedRecipe.created_at)}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
