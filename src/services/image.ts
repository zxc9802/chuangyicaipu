import axios from 'axios';

const APP_ID = import.meta.env.VITE_APP_ID;

interface ImageGenerationResponse {
  status: number;
  msg: string;
  data: {
    task_id: string;
  };
}

interface ImageQueryResponse {
  status: number;
  msg: string;
  data: {
    log_id: number;
    task_id: number;
    task_status: 'INIT' | 'WAIT' | 'RUNNING' | 'FAILED' | 'SUCCESS';
    task_progress_detail: number;
    task_progress: number;
    sub_task_result_list: Array<{
      sub_task_status: 'INIT' | 'WAIT' | 'RUNNING' | 'FAILED' | 'SUCCESS';
      sub_task_progress_detail: number;
      sub_task_progress: number;
      sub_task_error_code: string;
      final_image_list: Array<{
        img_url: string;
        height: number;
        width: number;
        img_approve_conclusion: string;
      }>;
    }>;
  };
}

export const generateDishImage = async (prompt: string): Promise<string> => {
  try {
    const response = await axios.post<ImageGenerationResponse>(
      '/api/miaoda/runtime/apicenter/source/proxy/iragtextToImageiiVMkBQMEHfZ6rd',
      {
        prompt: prompt
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-App-Id': APP_ID
        }
      }
    );

    if (response.data.status === 999) {
      throw new Error(response.data.msg);
    }

    if (response.data.status !== 0) {
      throw new Error(response.data.msg || '图片生成失败');
    }

    return response.data.data.task_id;
  } catch (error: any) {
    if (error.response?.data?.status === 999) {
      throw new Error(error.response.data.msg);
    }
    throw new Error(error.message || '图片生成请求失败');
  }
};

export const queryImageResult = async (taskId: string): Promise<ImageQueryResponse['data']> => {
  try {
    const response = await axios.post<ImageQueryResponse>(
      '/api/miaoda/runtime/apicenter/source/proxy/iraggetImgjWUTzny87hoV6fSaYzr2Rj',
      {
        task_id: taskId
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-App-Id': APP_ID
        }
      }
    );

    if (response.data.status === 999) {
      throw new Error(response.data.msg);
    }

    if (response.data.status !== 0) {
      throw new Error(response.data.msg || '查询图片结果失败');
    }

    return response.data.data;
  } catch (error: any) {
    if (error.response?.data?.status === 999) {
      throw new Error(error.response.data.msg);
    }
    throw new Error(error.message || '查询图片结果失败');
  }
};

export const pollImageResult = async (
  taskId: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  const maxAttempts = 60;
  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      const result = await queryImageResult(taskId);

      if (onProgress) {
        onProgress(result.task_progress_detail);
      }

      if (result.task_status === 'SUCCESS') {
        const imageUrl = result.sub_task_result_list?.[0]?.final_image_list?.[0]?.img_url;
        if (imageUrl) {
          return imageUrl;
        }
        throw new Error('未找到生成的图片');
      }

      if (result.task_status === 'FAILED') {
        throw new Error('图片生成失败');
      }

      await new Promise(resolve => setTimeout(resolve, 3000));
      attempts++;
    } catch (error: any) {
      if (attempts >= maxAttempts - 1) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, 3000));
      attempts++;
    }
  }

  throw new Error('图片生成超时，请稍后重试');
};
