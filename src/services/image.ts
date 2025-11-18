import axios from 'axios';

const APP_ID = import.meta.env.VITE_APP_ID;

interface NanoBananaResponse {
  status: number;
  msg: string;
  candidates: Array<{
    content: {
      role: string;
      parts: Array<{
        text: string;
      }>;
    };
    finishReason: string;
    safetyRatings: any[];
  }>;
}

export const generateDishImage = async (prompt: string): Promise<string> => {
  try {
    const response = await axios.post<NanoBananaResponse>(
      '/api/miaoda/runtime/apicenter/source/proxy/nanogenimageq3JhFmBtNz',
      {
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-App-Id': APP_ID
        },
        timeout: 300000
      }
    );

    if (response.data.status === 999) {
      throw new Error(response.data.msg);
    }

    if (response.data.status !== 0) {
      throw new Error(response.data.msg || '图片生成失败');
    }

    const candidate = response.data.candidates?.[0];
    if (!candidate) {
      throw new Error('未获取到生成结果');
    }

    const textContent = candidate.content?.parts?.[0]?.text;
    if (!textContent) {
      throw new Error('未找到生成的图片数据');
    }

    const base64Match = textContent.match(/data:image\/[^;]+;base64,([^)]+)/);
    if (!base64Match || !base64Match[0]) {
      throw new Error('无法解析图片数据');
    }

    return base64Match[0];
  } catch (error: any) {
    if (error.response?.data?.status === 999) {
      throw new Error(error.response.data.msg);
    }
    if (error.code === 'ECONNABORTED') {
      throw new Error('图片生成超时，请稍后重试');
    }
    throw new Error(error.message || '图片生成请求失败');
  }
};
