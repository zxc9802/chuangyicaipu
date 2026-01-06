import { forwardRef } from 'react';
import { ChefHat } from 'lucide-react';

interface ShareCardProps {
  ingredients: string[];
  seasonings: Array<{ name: string; amount: string }>;
  cookingMethod: string;
  evaluation: string;
  imageUrl: string;
}

const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  ({ ingredients, seasonings, cookingMethod, evaluation, imageUrl }, ref) => {
    return (
      <div
        ref={ref}
        className="w-[750px] bg-gradient-to-br from-[#FFF8F0] to-[#FFE8D6] p-12"
        style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
      >
        {/* 标题区域 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <ChefHat className="w-16 h-16 text-[#FF8C42]" />
            <h1 className="text-5xl font-bold text-[#333333]">创意食谱</h1>
          </div>
          <p className="text-2xl text-[#666666]">我的美食创意打卡</p>
        </div>

        {/* 配方信息卡片 */}
        <div className="bg-white rounded-2xl p-8 mb-6 shadow-lg">
          <div className="grid grid-cols-2 gap-6">
            {/* 食材 */}
            <div>
              <h3 className="text-2xl font-bold text-[#FF8C42] mb-4 flex items-center gap-2">
                <span className="w-2 h-8 bg-[#FF8C42] rounded"></span>
                食材
              </h3>
              <div className="space-y-2">
                {ingredients.map((item, index) => (
                  <div key={index} className="text-xl text-[#333333] flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#FF8C42] rounded-full"></span>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* 佐料 */}
            <div>
              <h3 className="text-2xl font-bold text-[#FF8C42] mb-4 flex items-center gap-2">
                <span className="w-2 h-8 bg-[#FF8C42] rounded"></span>
                佐料
              </h3>
              <div className="space-y-2">
                {seasonings.map((item, index) => (
                  <div key={index} className="text-xl text-[#333333] flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#FF8C42] rounded-full"></span>
                    {item.name} {item.amount}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 烹饪方式 */}
          <div className="mt-6 pt-6 border-t-2 border-[#FFE8D6]">
            <h3 className="text-2xl font-bold text-[#FF8C42] mb-3 flex items-center gap-2">
              <span className="w-2 h-8 bg-[#FF8C42] rounded"></span>
              烹饪方式
            </h3>
            <div className="inline-block bg-[#FF8C42] text-white px-6 py-3 rounded-full text-2xl font-medium">
              {cookingMethod}
            </div>
          </div>
        </div>

        {/* AI评价 */}
        <div className="bg-white rounded-2xl p-8 mb-6 shadow-lg">
          <h3 className="text-2xl font-bold text-[#FF8C42] mb-4 flex items-center gap-2">
            <span className="w-2 h-8 bg-[#FF8C42] rounded"></span>
            AI 专业评价
          </h3>
          <div className="text-lg text-[#333333] leading-relaxed whitespace-pre-wrap">
            {evaluation}
          </div>
        </div>

        {/* 成品图片 */}
        {imageUrl && (
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-[#FF8C42] mb-4 flex items-center gap-2">
              <span className="w-2 h-8 bg-[#FF8C42] rounded"></span>
              菜品效果图
            </h3>
            <div className="rounded-xl overflow-hidden">
              <img
                src={imageUrl}
                alt="菜品效果图"
                crossOrigin="anonymous"
                className="w-full h-auto"
              />
            </div>
          </div>
        )}

        {/* 底部标识 */}
        <div className="text-center mt-8 pt-6 border-t-2 border-[#FFE8D6]">
          <p className="text-xl text-[#999999]">创意食谱 · AI美食助手</p>
          <p className="text-lg text-[#BBBBBB] mt-2">探索无限美食可能</p>
        </div>
      </div>
    );
  }
);

ShareCard.displayName = 'ShareCard';

export default ShareCard;
