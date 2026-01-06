import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ChefHat, Plus, Trash2, Sparkles, Loader2, Share2, Download } from 'lucide-react';
import { sendChatStream } from '@/services/chat';
import { generateDishImage } from '@/services/image';
import { Streamdown } from 'streamdown';
import html2canvas from 'html2canvas';
import ShareCard from '@/components/ShareCard';

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
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isGeneratingShareCard, setIsGeneratingShareCard] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const shareCardRef = useRef<HTMLDivElement>(null);

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
    setIsGeneratingImage(false);

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

请用简洁专业的语言回答，分段说明。如果这道菜的搭配不合理或不建议制作，请明确指出问题所在。`;

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
          console.log('AI分析完成，开始生成图片');
          setIsGeneratingImage(true);
          toast.info('文字分析完成，正在生成菜品图片...', { duration: 3000 });
          
          // 判断评价是否为负面
          const negativeKeywords = [
            '不建议', '不推荐', '不合理', '不搭配', '不协调', '不适合',
            '奇怪', '怪异', '难以', '失败', '糟糕', '不好', '不佳',
            '问题', '风险', '注意', '谨慎', '避免', '不宜'
          ];
          
          const isNegative = negativeKeywords.some(keyword => 
            analysisText.toLowerCase().includes(keyword)
          );

          console.log('评价是否为负面:', isNegative);

          let imagePrompt = '';
          if (isNegative) {
            // 负面评价：生成抽象、简单的图片
            imagePrompt = `一道${cookingMethod}的菜品，食材${ingredientsList}，简单摆盘，家常风格，自然光线，普通拍摄，抽象风格`;
          } else {
            // 正面评价：生成精美的图片
            imagePrompt = `一道精美的${cookingMethod}菜品，食材包括${ingredientsList}，摆盘精致，美食摄影，高清，专业灯光，细节丰富`;
          }

          console.log('图片生成prompt:', imagePrompt);

          try {
            const imageUrl = await generateDishImage(imagePrompt);
            console.log('图片生成成功，URL长度:', imageUrl.length);

            setAnalysisResult({
              taste: analysisText.split('\n')[0] || analysisText,
              evaluation: analysisText,
              imageUrl: imageUrl
            });

            setIsGeneratingImage(false);
            toast.success('分析完成！');
          } catch (error: any) {
            console.error('图片生成失败:', error);
            setIsGeneratingImage(false);
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
    setIsGeneratingImage(false);
  };

  const handleGenerateShareCard = async () => {
    if (!shareCardRef.current) return;

    setIsGeneratingShareCard(true);
    toast.info('正在生成打卡图片...', { duration: 2000 });

    try {
      const canvas = await html2canvas(shareCardRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#FFF8F0',
        logging: false
      });

      const dataUrl = canvas.toDataURL('image/png');
      
      const link = document.createElement('a');
      link.download = `创意食谱打卡-${new Date().getTime()}.png`;
      link.href = dataUrl;
      link.click();

      toast.success('打卡图片已生成并下载！');
      setIsDialogOpen(false);
    } catch (error) {
      console.error('生成打卡图片失败:', error);
      toast.error('生成打卡图片失败，请重试');
    } finally {
      setIsGeneratingShareCard(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 xl:py-12 px-4 xl:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <ChefHat className="w-12 h-12 xl:w-16 xl:h-16 text-primary" />
            <h1 className="text-4xl xl:text-6xl font-bold text-foreground">创意食谱</h1>
          </div>
          <p className="text-muted-foreground text-lg xl:text-xl">输入食材和烹饪方式，AI帮你预测菜品味道并生成精美效果图</p>
        </div>

        <div className="grid xl:grid-cols-2 gap-8">
          <Card className="shadow-[var(--shadow-elegant)] xl:sticky xl:top-8 xl:self-start">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                食材配方
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label className="text-lg font-medium">食材</Label>
                {ingredients.map((ingredient, index) => (
                  <div key={ingredient.id} className="flex gap-3">
                    <Input
                      placeholder={`食材 ${index + 1}`}
                      value={ingredient.name}
                      onChange={(e) => updateIngredient(ingredient.id, e.target.value)}
                      className="flex-1 h-12 text-base"
                    />
                    {ingredients.length > 1 && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => removeIngredient(ingredient.id)}
                        className="min-w-[48px] min-h-[48px]"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={addIngredient}
                  className="w-full min-h-[48px] text-base"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  添加食材
                </Button>
              </div>

              <div className="space-y-4">
                <Label className="text-lg font-medium">佐料及用量</Label>
                {seasonings.map((seasoning, index) => (
                  <div key={seasoning.id} className="flex gap-3">
                    <Input
                      placeholder={`佐料 ${index + 1}`}
                      value={seasoning.name}
                      onChange={(e) => updateSeasoning(seasoning.id, 'name', e.target.value)}
                      className="flex-1 h-12 text-base"
                    />
                    <Input
                      placeholder="用量"
                      value={seasoning.amount}
                      onChange={(e) => updateSeasoning(seasoning.id, 'amount', e.target.value)}
                      className="w-32 h-12 text-base"
                    />
                    {seasonings.length > 1 && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => removeSeasoning(seasoning.id)}
                        className="min-w-[48px] min-h-[48px]"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={addSeasoning}
                  className="w-full min-h-[48px] text-base"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  添加佐料
                </Button>
              </div>

              <div className="space-y-4">
                <Label className="text-lg font-medium">烹饪方式</Label>
                <Select value={cookingMethod} onValueChange={setCookingMethod}>
                  <SelectTrigger className="min-h-[48px] text-base">
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

              <div className="flex gap-4 pt-4">
                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="flex-1 min-h-[56px] text-lg"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                      分析中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-6 h-6 mr-2" />
                      开始分析
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleReset}
                  disabled={isAnalyzing}
                  className="min-h-[56px] px-8 text-lg"
                >
                  重置
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-8">
            {(currentAnalysis || analysisResult) && (
              <Card className="shadow-[var(--shadow-elegant)] animate-fade-in">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <ChefHat className="w-6 h-6 text-primary" />
                    AI 分析结果
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {currentAnalysis && (
                    <div className="prose prose-base max-w-none text-base leading-relaxed">
                      <Streamdown>{currentAnalysis}</Streamdown>
                    </div>
                  )}

                  {isGeneratingImage && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center gap-3 py-8">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <span className="text-muted-foreground font-medium text-lg">正在生成菜品图片，请稍候...</span>
                      </div>
                    </div>
                  )}

                  {analysisResult?.imageUrl && (
                    <div className="space-y-3">
                      <Label className="text-lg font-medium">菜品效果图</Label>
                      <div className="rounded-xl overflow-hidden border-2 border-border shadow-lg">
                        <img
                          src={analysisResult.imageUrl}
                          alt="菜品效果图"
                          crossOrigin="anonymous"
                          className="w-full h-auto"
                        />
                      </div>
                      
                      {/* 生成打卡图片按钮 */}
                      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                          <Button className="w-full min-h-[56px] text-lg" variant="default">
                            <Share2 className="w-6 h-6 mr-2" />
                            生成打卡图片
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="text-2xl">打卡图片预览</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="flex justify-center bg-muted p-4 rounded-lg">
                              <ShareCard
                                ref={shareCardRef}
                                ingredients={ingredients.filter(i => i.name.trim()).map(i => i.name)}
                                seasonings={seasonings.filter(s => s.name.trim())}
                                cookingMethod={cookingMethod}
                                evaluation={analysisResult.evaluation}
                                imageUrl={analysisResult.imageUrl}
                              />
                            </div>
                            <Button
                              onClick={handleGenerateShareCard}
                              disabled={isGeneratingShareCard}
                              className="w-full min-h-[56px] text-lg"
                            >
                              {isGeneratingShareCard ? (
                                <>
                                  <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                                  生成中...
                                </>
                              ) : (
                                <>
                                  <Download className="w-6 h-6 mr-2" />
                                  下载打卡图片
                                </>
                              )}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {!currentAnalysis && !analysisResult && (
              <Card className="shadow-[var(--shadow-elegant)] border-dashed">
                <CardContent className="py-16 xl:py-24">
                  <div className="text-center space-y-4">
                    <ChefHat className="w-20 h-20 xl:w-24 xl:h-24 mx-auto text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground text-lg xl:text-xl">
                      输入食材信息后，点击"开始分析"按钮
                      <br />
                      AI将为您生成专业的菜品分析和效果图
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
