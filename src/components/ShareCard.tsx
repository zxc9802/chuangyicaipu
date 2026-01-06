import { forwardRef } from 'react';
import { ChefHat } from 'lucide-react';

interface ShareCardProps {
  ingredients: string[];
  seasonings: Array<{ name: string; amount: string }>;
  cookingMethod: string;
  imageUrl: string;
}

const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  ({ ingredients, seasonings, cookingMethod, imageUrl }, ref) => {
    return (
      <div
        ref={ref}
        className="w-[360px] bg-gradient-to-br from-[#FFF8F0] to-[#FFE8D6] p-6"
        style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
      >
        {/* 标题区域 */}
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <ChefHat className="w-8 h-8 text-[#FF8C42]" />
            <h1 className="text-2xl font-bold text-[#333333]">创意食谱</h1>
          </div>
          <p className="text-sm text-[#666666]">我的美食创意打卡</p>
        </div>

        {/* 配方信息卡片 */}
        <div className="bg-white rounded-xl p-4 mb-4 shadow-lg">
          {/* 食材 */}
          <div className="mb-3">
            <h3 className="text-base font-bold text-[#FF8C42] mb-2 flex items-center gap-1">
              <span className="w-1 h-4 bg-[#FF8C42] rounded"></span>
              食材
            </h3>
            <div className="space-y-1">
              {ingredients.map((item, index) => (
                <div key={index} className="text-sm text-[#333333] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-[#FF8C42] rounded-full"></span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* 佐料 */}
          <div className="mb-3">
            <h3 className="text-base font-bold text-[#FF8C42] mb-2 flex items-center gap-1">
              <span className="w-1 h-4 bg-[#FF8C42] rounded"></span>
              佐料
            </h3>
            <div className="space-y-1">
              {seasonings.map((item, index) => (
                <div key={index} className="text-sm text-[#333333] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-[#FF8C42] rounded-full"></span>
                  {item.name} {item.amount}
                </div>
              ))}
            </div>
          </div>

          {/* 烹饪方式 */}
          <div className="pt-3 border-t border-[#FFE8D6]">
            <h3 className="text-base font-bold text-[#FF8C42] mb-2 flex items-center gap-1">
              <span className="w-1 h-4 bg-[#FF8C42] rounded"></span>
              烹饪方式
            </h3>
            <div className="inline-block bg-[#FF8C42] text-white px-4 py-1.5 rounded-full text-sm font-medium">
              {cookingMethod}
            </div>
          </div>
        </div>

        {/* 成品图片 */}
        {imageUrl && (
          <div className="bg-white rounded-xl p-4 shadow-lg mb-4">
            <h3 className="text-base font-bold text-[#FF8C42] mb-2 flex items-center gap-1">
              <span className="w-1 h-4 bg-[#FF8C42] rounded"></span>
              菜品效果图
            </h3>
            <div className="rounded-lg overflow-hidden">
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
        <div className="text-center pt-3 border-t border-[#FFE8D6]">
          <p className="text-xs text-[#999999]">创意食谱 · AI美食助手</p>
        </div>
      </div>
    );
  }
);

ShareCard.displayName = 'ShareCard';

export default ShareCard;
