import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ChefHat, Plus, Trash2, Sparkles, Loader2 } from 'lucide-react';
import { sendChatStream } from '@/services/chat';
import { generateDishImage, pollImageResult } from '@/services/image';
import { Streamdown } from 'streamdown';

interface Ingredient {
  id: string;
  name: string;
}

interface Seasoning {
  id: string;
  name: string;
  amount: string;
}

interface AnalysisResult {
  taste: string;
  evaluation: string;
  imageUrl: string;
}

export default function Home() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([{ id: '1', name: '' }]);
  const [seasonings, setSeasonings] = useState<Seasoning[]>([{ id: '1', name: '', amount: '' }]);
  const [cookingMethod, setCookingMethod] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [currentAnalysis, setCurrentAnalysis] = useState('');
  const [imageProgress, setImageProgress] = useState(0);

  const addIngredient = () => {
    setIngredients([...ingredients, { id: Date.now().toString(), name: '' }]);
  };

  const removeIngredient = (id: string) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter(item => item.id !== id));
    }
  };

  const updateIngredient = (id: string, name: string) => {
    setIngredients(ingredients.map(item => item.id === id ? { ...item, name } : item));
  };

  const addSeasoning = () => {
    setSeasonings([...seasonings, { id: Date.now().toString(), name: '', amount: '' }]);
  };

  const removeSeasoning = (id: string) => {
    if (seasonings.length > 1) {
      setSeasonings(seasonings.filter(item => item.id !== id));
    }
  };

  const updateSeasoning = (id: string, field: 'name' | 'amount', value: string) => {
    setSeasonings(seasonings.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleAnalyze = async () => {
    const validIngredients = ingredients.filter(item => item.name.trim());
    const validSeasonings = seasonings.filter(item => item.name.trim());

    if (validIngredients.length === 0) {
      toast.error('请至少输入一种食材');
      return;
    }

    if (!cookingMethod) {
      toast.error('请选择烹饪方式');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);
    setCurrentAnalysis('');
    setImageProgress(0);

    try {
      const ingredientsList = validIngredients.map(item => item.name).join('、');
      const seasoningsList = validSeasonings.map(item => 
        item.amount ? `${item.name}${item.amount}` : item.name
      ).join('、');

      const prompt = `我想做一道菜，使用的食材有：${ingredientsList}${seasoningsList ? `，佐料有：${seasoningsList}` : ''}，烹饪方式是${cookingMethod}。

请你作为专业的美食评论家，帮我分析：
1. 这道菜可能呈现的味道特点（如鲜香微辣、酸甜可口等）
2. 对这道菜的综合评价，包括：
   - 口味搭配合理性
   - 营养均衡度
   - 创意指数

请用简洁专业的语言回答，分段说明。`;

      let analysisText = '';

      await sendChatStream({
        endpoint: 'https://api-integrations.appmiaoda.com/app-7ms5uhd87b41/api-2bk93oeO9NlE/v2/chat/completions',
        apiId: import.meta.env.VITE_APP_ID,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        onUpdate: (content: string) => {
          analysisText = content;
          setCurrentAnalysis(content);
        },
        onComplete: async () => {
          const imagePrompt = `一道精美的${cookingMethod}菜品，食材包括${ingredientsList}，摆盘精致，美食摄影，高清，专业灯光`;

          try {
            const taskId = await generateDishImage(imagePrompt);
            
            const imageUrl = await pollImageResult(taskId, (progress) => {
              setImageProgress(Math.round(progress * 100));
            });

            setAnalysisResult({
              taste: analysisText.split('\n')[0] || analysisText,
              evaluation: analysisText,
              imageUrl: imageUrl
            });

            toast.success('分析完成！');
          } catch (error: any) {
            toast.error(error.message || '图片生成失败');
            setAnalysisResult({
              taste: analysisText.split('\n')[0] || analysisText,
              evaluation: analysisText,
              imageUrl: ''
            });
          } finally {
            setIsAnalyzing(false);
          }
        },
        onError: (error: Error) => {
          toast.error(error.message || 'AI分析失败，请重试');
          setIsAnalyzing(false);
        }
      });
    } catch (error: any) {
      toast.error(error.message || '分析失败，请重试');
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setIngredients([{ id: '1', name: '' }]);
    setSeasonings([{ id: '1', name: '', amount: '' }]);
    setCookingMethod('');
    setAnalysisResult(null);
    setCurrentAnalysis('');
    setImageProgress(0);
  };

  return (
    <div className="min-h-screen bg-background py-6 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <ChefHat className="w-8 h-8 text-primary" />
            <h1 className="text-3xl max-sm:text-2xl font-bold text-foreground">创意食谱</h1>
          </div>
          <p className="text-muted-foreground text-sm">输入食材和烹饪方式，AI帮你预测菜品味道</p>
        </div>

        <Card className="shadow-[var(--shadow-elegant)]">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              食材配方
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label className="text-base font-medium">食材</Label>
              {ingredients.map((ingredient, index) => (
                <div key={ingredient.id} className="flex gap-2">
                  <Input
                    placeholder={`食材 ${index + 1}`}
                    value={ingredient.name}
                    onChange={(e) => updateIngredient(ingredient.id, e.target.value)}
                    className="flex-1"
                  />
                  {ingredients.length > 1 && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeIngredient(ingredient.id)}
                      className="min-w-[44px] min-h-[44px]"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                onClick={addIngredient}
                className="w-full min-h-[44px]"
              >
                <Plus className="w-4 h-4 mr-2" />
                添加食材
              </Button>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-medium">佐料及用量</Label>
              {seasonings.map((seasoning, index) => (
                <div key={seasoning.id} className="flex gap-2">
                  <Input
                    placeholder={`佐料 ${index + 1}`}
                    value={seasoning.name}
                    onChange={(e) => updateSeasoning(seasoning.id, 'name', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="用量"
                    value={seasoning.amount}
                    onChange={(e) => updateSeasoning(seasoning.id, 'amount', e.target.value)}
                    className="w-24"
                  />
                  {seasonings.length > 1 && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeSeasoning(seasoning.id)}
                      className="min-w-[44px] min-h-[44px]"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                onClick={addSeasoning}
                className="w-full min-h-[44px]"
              >
                <Plus className="w-4 h-4 mr-2" />
                添加佐料
              </Button>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-medium">烹饪方式</Label>
              <Select value={cookingMethod} onValueChange={setCookingMethod}>
                <SelectTrigger className="min-h-[44px]">
                  <SelectValue placeholder="选择烹饪方式" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="炒">炒</SelectItem>
                  <SelectItem value="煮">煮</SelectItem>
                  <SelectItem value="炸">炸</SelectItem>
                  <SelectItem value="蒸">蒸</SelectItem>
                  <SelectItem value="烤">烤</SelectItem>
                  <SelectItem value="炖">炖</SelectItem>
                  <SelectItem value="煎">煎</SelectItem>
                  <SelectItem value="焖">焖</SelectItem>
                  <SelectItem value="拌">拌</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="flex-1 min-h-[48px] text-base"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    分析中...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    开始分析
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={isAnalyzing}
                className="min-h-[48px]"
              >
                重置
              </Button>
            </div>
          </CardContent>
        </Card>

        {(currentAnalysis || analysisResult) && (
          <Card className="shadow-[var(--shadow-elegant)] animate-fade-in">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-primary" />
                AI 分析结果
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentAnalysis && (
                <div className="prose prose-sm max-w-none">
                  <Streamdown>{currentAnalysis}</Streamdown>
                </div>
              )}

              {isAnalyzing && imageProgress > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">正在生成菜品图片...</span>
                    <span className="text-primary font-medium">{imageProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${imageProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {analysisResult?.imageUrl && (
                <div className="space-y-2">
                  <Label className="text-base font-medium">菜品效果图</Label>
                  <div className="rounded-lg overflow-hidden border border-border">
                    <img
                      src={analysisResult.imageUrl}
                      alt="菜品效果图"
                      crossOrigin="anonymous"
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
