import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useRecipes } from '../hooks/useRecipes';
import { supabase } from '../lib/supabase';
import { Button, Input, Textarea, StarRating, LoadingSpinner } from '../components';
import type { Recipe } from '../types';
import {
  BASE_SPIRITS,
  FLAVOR_TAGS,
  TEXTURE_TAGS,
  INGREDIENT_UNITS,
  type CreateRecipeFormData,
  type Ingredient,
  type BaseSpirit,
  type FlavorTag,
  type TextureTag,
  type IngredientUnit,
} from '../types';

// 图片裁剪状态类型
interface CropState {
  scale: number;
  positionX: number;
  positionY: number;
}

export function CreateRecipe() {
  const { user } = useAuth();
  const { createRecipe, updateRecipe, fetchRecipeById } = useRecipes();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');

  const [loading, setLoading] = useState(false);
  const [loadingRecipe, setLoadingRecipe] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [generatingDesc, setGeneratingDesc] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);
  const [originalRecipe, setOriginalRecipe] = useState<Recipe | null>(null);

  // 图片裁剪相关状态
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropState, setCropState] = useState<CropState>({
    scale: 1,
    positionX: 0,
    positionY: 0,
  });
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageNaturalSize, setImageNaturalSize] = useState({ width: 0, height: 0 });
  const cropImageRef = useRef<HTMLImageElement>(null);
  const cropContainerRef = useRef<HTMLDivElement>(null);

  // 保存裁剪后的显示参数
  const [savedCrop, setSavedCrop] = useState<CropState | null>(null);

  const [formData, setFormData] = useState<CreateRecipeFormData & {
    base_spirit: BaseSpirit;
    flavor_tags: FlavorTag[];
    texture_tag: TextureTag;
  }>({
    title: '',
    image_url: '',
    style: '古典',
    base_spirit: '金酒',
    flavor_tags: [],
    texture_tag: '清爽',
    description: '',
    ingredients: [{ name: '', amount: 0, unit: 'ml' }],
    steps: [{ order: 1, description: '' }],
    rating: 5,
    review: '',
  });

  // 显示Toast提示
  const showToast = (message: string, type: 'error' | 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // 上传图片到 Supabase Storage
  const uploadImage = useCallback(async (file: File): Promise<string> => {
    try {
      setUploadingImage(true);

      // 生成唯一文件名
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `recipes/${fileName}`;

      console.log('开始上传图片:', { fileName, filePath });

      // 上传到 Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('recipe-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('Supabase 上传错误:', uploadError);
        throw uploadError;
      }

      console.log('图片上传成功，获取公开 URL');

      // 获取公开 URL
      const { data: { publicUrl } } = supabase.storage
        .from('recipe-images')
        .getPublicUrl(filePath);

      console.log('公开 URL:', publicUrl);
      return publicUrl;
    } catch (err: any) {
      console.error('图片上传失败:', err);
      const errorMessage = err?.message || '图片上传失败';
      throw new Error(`${errorMessage}\n\n请检查：\n1. Storage bucket 名称是否为 "recipe-images"\n2. bucket 是否设置为公开\n3. 是否配置了正确的访问策略`);
    } finally {
      setUploadingImage(false);
    }
  }, []);

  // 处理图片上传完成后打开裁剪 modal
  const handleImageUploaded = useCallback((url: string) => {
    setFormData((prev) => ({ ...prev, image_url: url }));
    // 重置裁剪状态
    setCropState({ scale: 1, positionX: 0, positionY: 0 });
    setSavedCrop(null);
    setShowCropModal(true);
  }, []);

  // 图片加载完成后获取原始尺寸并计算初始缩放
  const handleCropImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImageNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });

    // 计算初始缩放，使图片填满裁剪区域
    if (cropContainerRef.current) {
      const containerWidth = cropContainerRef.current.clientWidth;
      const containerHeight = cropContainerRef.current.clientHeight;
      const containerRatio = containerWidth / containerHeight;
      const imageRatio = img.naturalWidth / img.naturalHeight;

      let initialScale = 1;
      if (imageRatio > containerRatio) {
        // 图片更宽，以高度为准
        initialScale = containerHeight / img.naturalHeight;
        // 确保宽度也能覆盖
        if (img.naturalWidth * initialScale < containerWidth) {
          initialScale = containerWidth / img.naturalWidth;
        }
      } else {
        // 图片更高，以宽度为准
        initialScale = containerWidth / img.naturalWidth;
        // 确保高度也能覆盖
        if (img.naturalHeight * initialScale < containerHeight) {
          initialScale = containerHeight / img.naturalHeight;
        }
      }
      setCropState((prev) => ({ ...prev, scale: initialScale }));
    }
  }, []);

  // 图片拖拽开始
  const handleCropMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingImage(true);
    setDragStart({ x: e.clientX - cropState.positionX, y: e.clientY - cropState.positionY });
  }, [cropState.positionX, cropState.positionY]);

  // 图片拖拽移动
  const handleCropMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDraggingImage) return;
    e.preventDefault();
    setCropState((prev) => ({
      ...prev,
      positionX: e.clientX - dragStart.x,
      positionY: e.clientY - dragStart.y,
    }));
  }, [isDraggingImage, dragStart]);

  // 图片拖拽结束
  const handleCropMouseUp = useCallback(() => {
    setIsDraggingImage(false);
  }, []);

  // 滚轮缩放
  const handleCropWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setCropState((prev) => ({
      ...prev,
      scale: Math.max(0.5, Math.min(3, prev.scale + delta)),
    }));
  }, []);

  // 重置裁剪
  const resetCrop = useCallback(() => {
    if (cropImageRef.current && cropContainerRef.current) {
      const containerWidth = cropContainerRef.current.clientWidth;
      const containerHeight = cropContainerRef.current.clientHeight;
      const containerRatio = containerWidth / containerHeight;
      const imageRatio = imageNaturalSize.width / imageNaturalSize.height;

      let initialScale = 1;
      if (imageRatio > containerRatio) {
        initialScale = containerHeight / imageNaturalSize.height;
        if (imageNaturalSize.width * initialScale < containerWidth) {
          initialScale = containerWidth / imageNaturalSize.width;
        }
      } else {
        initialScale = containerWidth / imageNaturalSize.width;
        if (imageNaturalSize.height * initialScale < containerHeight) {
          initialScale = containerHeight / imageNaturalSize.height;
        }
      }
      setCropState({ scale: initialScale, positionX: 0, positionY: 0 });
    }
  }, [imageNaturalSize]);

  // 确认裁剪 - 保存裁剪参数
  const confirmCrop = useCallback(() => {
    setSavedCrop({ ...cropState });
    setShowCropModal(false);
    showToast('图片调整成功！', 'success');
  }, [cropState]);

  const handleInputChange = (
    field: keyof Omit<CreateRecipeFormData, 'ingredients' | 'steps' | 'rating' | 'style' | 'base_spirit' | 'texture_tag' | 'flavor_tags'>,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleIngredientChange = (
    index: number,
    field: keyof Ingredient,
    value: string | number
  ) => {
    setFormData((prev) => {
      const ingredients = [...prev.ingredients];
      ingredients[index] = { ...ingredients[index], [field]: value };
      return { ...prev, ingredients };
    });
  };

  const addIngredient = () => {
    setFormData((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: '', amount: 0, unit: 'ml' }],
    }));
  };

  const removeIngredient = (index: number) => {
    if (formData.ingredients.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  };

  const handleStepChange = (index: number, value: string) => {
    setFormData((prev) => {
      const steps = [...prev.steps];
      steps[index] = { ...steps[index], description: value };
      return { ...prev, steps };
    });
  };

  const addStep = () => {
    setFormData((prev) => ({
      ...prev,
      steps: [...prev.steps, { order: prev.steps.length + 1, description: '' }],
    }));
  };

  const removeStep = (index: number) => {
    if (formData.steps.length <= 1) return;
    setFormData((prev) => {
      const steps = prev.steps
        .filter((_, i) => i !== index)
        .map((step, i) => ({ ...step, order: i + 1 }));
      return { ...prev, steps };
    });
  };

  // 风味标签切换
  const toggleFlavorTag = (tag: FlavorTag) => {
    setFormData((prev) => ({
      ...prev,
      flavor_tags: prev.flavor_tags.includes(tag)
        ? prev.flavor_tags.filter((t) => t !== tag)
        : [...prev.flavor_tags, tag],
    }));
  };

  // 图片拖拽上传
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find((file) => file.type.startsWith('image/'));

    if (imageFile) {
      try {
        showToast('正在上传图片...', 'success');
        const publicUrl = await uploadImage(imageFile);
        handleImageUploaded(publicUrl);
      } catch (err) {
        showToast(err instanceof Error ? err.message : '图片上传失败', 'error');
      }
    }
  }, [uploadImage, handleImageUploaded]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        showToast('正在上传图片...', 'success');
        const publicUrl = await uploadImage(file);
        handleImageUploaded(publicUrl);
      } catch (err) {
        showToast(err instanceof Error ? err.message : '图片上传失败', 'error');
      }
    }
  }, [uploadImage, handleImageUploaded]);

  // 检查是否有有效配料
  const hasValidIngredients = () => {
    return formData.ingredients.some(
      (i) => i.name.trim() && i.amount > 0
    );
  };

  // AI 生成简介
  const generateDescription = () => {
    // 校验：是否填写了配料清单
    if (!hasValidIngredients()) {
      showToast('请先填写配料清单后再生成简介', 'error');
      return;
    }

    setGeneratingDesc(true);
    setTimeout(() => {
      // 基于基底、风味、口感生成简洁描述（30字以内）
      const shortDescriptions: Record<string, string> = {
        '金酒': '草本芬芳，清爽怡人，独具一格',
        '伏特加': '纯净顺滑，简约而不简单',
        '朗姆': '热带风情，甜蜜温润',
        '威士忌': '醇厚优雅，回味悠长',
        '龙舌兰': '热烈奔放，个性鲜明',
        '白兰地': '优雅果香，温润细腻',
        '无醇': '清爽健康，别有风味'
      };

      const desc = shortDescriptions[formData.base_spirit] || `${formData.texture_tag}适口，风味独特`;

      setFormData((prev) => ({ ...prev, description: desc }));
      setGeneratingDesc(false);
      showToast('简介生成成功', 'success');
    }, 800);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      // 验证必填字段
      if (!formData.title.trim()) throw new Error('请输入鸡尾酒名称');
      if (!formData.image_url.trim()) throw new Error('请上传封面图片');
      if (!formData.base_spirit) throw new Error('请选择基底属性');
      if (!formData.texture_tag) throw new Error('请选择口感气质');
      if (formData.flavor_tags.length === 0) throw new Error('请至少选择一个主调风味');

      // 验证配料
      const validIngredients = formData.ingredients.filter(
        (i) => i.name.trim() && i.amount > 0
      );
      if (validIngredients.length === 0) {
        throw new Error('请至少添加一种配料');
      }

      // 验证步骤
      const validSteps = formData.steps.filter((s) => s.description.trim());
      if (validSteps.length === 0) {
        throw new Error('请至少添加一个制作步骤');
      }

      if (editId && originalRecipe) {
        // 编辑模式：更新配方
        console.log('正在更新配方...', formData);
        await updateRecipe(editId, formData);
        showToast('配方更新成功！', 'success');
        navigate(`/recipe/${editId}`);
      } else {
        // 创建模式：新建配方
        console.log('正在创建配方...', formData);
        const recipeId = await createRecipe(user.id, formData);
        if (!recipeId) {
          throw new Error('创建配方失败，请重试');
        }
        showToast('配方发布成功！', 'success');
        navigate('/');
      }
    } catch (err) {
      console.error('提交配方出错:', err);
      showToast(err instanceof Error ? err.message : '提交失败，请重试', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 加载编辑模式的配方数据
  useEffect(() => {
    if (editId) {
      const loadRecipe = async () => {
        setLoadingRecipe(true);
        try {
          const recipe = await fetchRecipeById(editId);
          if (recipe) {
            setOriginalRecipe(recipe);
            setFormData({
              title: recipe.title,
              image_url: recipe.image_url,
              style: recipe.style || '古典',
              base_spirit: recipe.base_spirit || '金酒',
              flavor_tags: recipe.flavor_tags || [],
              texture_tag: recipe.texture_tag || '清爽',
              description: recipe.description || '',
              ingredients: recipe.ingredients || [{ name: '', amount: 0, unit: 'ml' }],
              steps: recipe.steps || [{ order: 1, description: '' }],
              rating: recipe.rating || 5,
              review: recipe.review || '',
            });
          } else {
            showToast('配方不存在', 'error');
            navigate('/');
          }
        } catch (err) {
          console.error('加载配方失败:', err);
          showToast('加载配方失败', 'error');
        } finally {
          setLoadingRecipe(false);
        }
      };
      loadRecipe();
    }
  }, [editId, fetchRecipeById, navigate]);

  // 全局鼠标事件监听，在裁剪 modal 外部也能响应
  useEffect(() => {
    if (showCropModal) {
      const handleGlobalMouseUp = () => setIsDraggingImage(false);
      const handleGlobalMouseMove = (e: MouseEvent) => {
        if (isDraggingImage) {
          setCropState((prev) => ({
            ...prev,
            positionX: e.clientX - dragStart.x,
            positionY: e.clientY - dragStart.y,
          }));
        }
      };

      window.addEventListener('mouseup', handleGlobalMouseUp);
      window.addEventListener('mousemove', handleGlobalMouseMove);
      return () => {
        window.removeEventListener('mouseup', handleGlobalMouseUp);
        window.removeEventListener('mousemove', handleGlobalMouseMove);
      };
    }
  }, [showCropModal, isDraggingImage, dragStart]);

  // 生成预览图片的样式
  const getPreviewImageStyle = (): React.CSSProperties => {
    if (!savedCrop || !formData.image_url) {
      return { objectFit: 'cover' as const };
    }

    // 使用一个容器和内部 transform 来实现预览
    return {
      objectFit: 'contain' as const,
      transform: `scale(${savedCrop.scale}) translate(${savedCrop.positionX / savedCrop.scale}px, ${savedCrop.positionY / savedCrop.scale}px)`,
      transformOrigin: 'center center',
    };
  };

  // 加载中状态
  if (loadingRecipe) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Toast 提示 */}
      {toast && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-xl flex items-center gap-3 transition-all duration-300 ${
          toast.type === 'error'
            ? 'bg-red-50 border border-red-200 text-red-700'
            : 'bg-green-50 border border-green-200 text-green-700'
        }`}>
          {toast.type === 'error' ? (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
          <span className="text-sm font-medium whitespace-pre-line">{toast.message}</span>
        </div>
      )}

      {/* 图片裁剪 Modal */}
      {showCropModal && formData.image_url && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">调整图片位置</h3>
              <p className="mt-1 text-sm text-gray-600">拖拽图片调整位置，滚轮缩放，点击确认保存</p>
            </div>

            <div className="p-6">
              {/* 裁剪区域 - 16:9 比例 */}
              <div
                ref={cropContainerRef}
                className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-300 cursor-move select-none"
                onMouseDown={handleCropMouseDown}
                onMouseMove={handleCropMouseMove}
                onMouseUp={handleCropMouseUp}
                onMouseLeave={handleCropMouseUp}
                onWheel={handleCropWheel}
              >
                <img
                  ref={cropImageRef}
                  src={formData.image_url}
                  alt="裁剪预览"
                  onLoad={handleCropImageLoad}
                  className="absolute inset-0 min-w-full min-h-full"
                  style={{
                    width: imageNaturalSize.width,
                    height: imageNaturalSize.height,
                    maxWidth: 'none',
                    maxHeight: 'none',
                    transform: `translate(calc(-50% + ${cropState.positionX}px), calc(-50% + ${cropState.positionY}px)) scale(${cropState.scale})`,
                    top: '50%',
                    left: '50%',
                    transformOrigin: 'center center',
                  }}
                  draggable={false}
                />
                {/* 遮罩层 - 突出显示中间区域 */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0 shadow-[inset_0_0_0_9999px_rgba(0,0,0,0.4)]" />
                  <div className="absolute inset-0 border-2 border-white/50" />
                </div>
              </div>

              {/* 操作提示 */}
              <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-4">
                  <span>🖱️ 拖拽移动</span>
                  <span>⚙️ 滚轮缩放</span>
                  <span>缩放: {(cropState.scale * 100).toFixed(0)}%</span>
                </div>
                <button
                  type="button"
                  onClick={resetCrop}
                  className="text-gray-600 hover:text-gray-900 underline"
                >
                  重置
                </button>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCropModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                onClick={confirmCrop}
                className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{editId ? '编辑配方' : '发布新配方'}</h1>
        <p className="mt-2 text-gray-600">{editId ? '修改您的鸡尾酒配方' : '分享您的独家鸡尾酒配方'}</p>
      </div>

      <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 基础信息 */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">基础信息</h2>

            <Input
              label="鸡尾酒名称 *"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="例如：尼格罗尼"
              required
            />

            {/* 图片上传 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                封面图片 *
              </label>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-md p-6 text-center transition-colors ${
                  isDragging
                    ? 'border-gray-500 bg-gray-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="space-y-2">
                  {uploadingImage ? (
                    <>
                      <div className="w-10 h-10 mx-auto border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                      <p className="text-sm text-gray-600">正在上传图片...</p>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-10 h-10 mx-auto text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <div className="text-sm text-gray-600">
                        <p>拖拽图片到这里，或</p>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          id="image-upload"
                          onChange={handleFileSelect}
                        />
                        <label
                          htmlFor="image-upload"
                          className="text-gray-900 cursor-pointer hover:underline"
                        >
                          点击选择文件
                        </label>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="mt-3">
                <Input
                  label="或粘贴图片 URL"
                  value={formData.image_url}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, image_url: e.target.value }));
                    setSavedCrop(null);
                  }}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              {formData.image_url && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">图片预览</span>
                    <button
                      type="button"
                      onClick={() => setShowCropModal(true)}
                      className="text-sm text-gray-600 hover:text-gray-900 underline"
                    >
                      调整图片
                    </button>
                  </div>
                  <div className="aspect-video bg-gray-100 rounded-md overflow-hidden relative">
                    {savedCrop ? (
                      <div className="absolute inset-0 overflow-hidden">
                        <img
                          src={formData.image_url}
                          alt="预览"
                          className="absolute"
                          style={{
                            width: imageNaturalSize.width || 'auto',
                            height: imageNaturalSize.height || 'auto',
                            maxWidth: 'none',
                            maxHeight: 'none',
                            transform: `translate(calc(-50% + ${savedCrop.positionX}px), calc(-50% + ${savedCrop.positionY}px)) scale(${savedCrop.scale})`,
                            top: '50%',
                            left: '50%',
                            transformOrigin: 'center center',
                          }}
                          onError={(e) => (e.currentTarget.style.display = 'none')}
                        />
                      </div>
                    ) : (
                      <img
                        src={formData.image_url}
                        alt="预览"
                        className="w-full h-full object-cover"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 三层标签 */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">标签分类</h2>

            {/* 基底属性 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                基底属性 *
              </label>
              <div className="flex flex-wrap gap-2">
                {BASE_SPIRITS.map((spirit) => (
                  <button
                    key={spirit}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, base_spirit: spirit }))}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      formData.base_spirit === spirit
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {spirit}
                  </button>
                ))}
              </div>
            </div>

            {/* 主调风味 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                主调风味 *（可多选）
              </label>
              <div className="flex flex-wrap gap-2">
                {FLAVOR_TAGS.map((flavor) => (
                  <button
                    key={flavor}
                    type="button"
                    onClick={() => toggleFlavorTag(flavor)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      formData.flavor_tags.includes(flavor)
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {flavor}
                  </button>
                ))}
              </div>
            </div>

            {/* 口感气质 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                口感气质 *
              </label>
              <div className="flex flex-wrap gap-2">
                {TEXTURE_TAGS.map((texture) => (
                  <button
                    key={texture}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, texture_tag: texture }))}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      formData.texture_tag === texture
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {texture}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 简介 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">简介</h2>
              <button
                type="button"
                onClick={generateDescription}
                disabled={generatingDesc}
                className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
              >
                {generatingDesc ? (
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                )}
                {generatingDesc ? '生成中...' : 'AI 生成简介'}
              </button>
            </div>
            <Textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="简单介绍一下这款鸡尾酒..."
              rows={3}
            />
          </div>

          {/* 配料清单 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">配料清单</h2>
              <button
                type="button"
                onClick={addIngredient}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                + 添加配料
              </button>
            </div>

            <div className="space-y-3">
              {formData.ingredients.map((ingredient, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={ingredient.name}
                      onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                      placeholder="原料名称"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    />
                  </div>
                  <div className="w-20">
                    <input
                      type="number"
                      value={ingredient.amount || ''}
                      onChange={(e) => handleIngredientChange(index, 'amount', Number(e.target.value) || 0)}
                      placeholder="0"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    />
                  </div>
                  <div className="w-20">
                    <select
                      value={ingredient.unit}
                      onChange={(e) => handleIngredientChange(index, 'unit', e.target.value as IngredientUnit)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white"
                    >
                      {INGREDIENT_UNITS.map((unit) => (
                        <option key={unit} value={unit}>
                          {unit}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    className="px-3 py-2 text-gray-400 hover:text-red-500 disabled:opacity-50"
                    disabled={formData.ingredients.length <= 1}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 制作步骤 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">制作步骤</h2>
              <button
                type="button"
                onClick={addStep}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                + 添加步骤
              </button>
            </div>

            <div className="space-y-3">
              {formData.steps.map((step, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={step.description}
                      onChange={(e) => handleStepChange(index, e.target.value)}
                      placeholder="描述这一步怎么做..."
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 resize-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeStep(index)}
                    className="px-3 py-2 text-gray-400 hover:text-red-500 disabled:opacity-50"
                    disabled={formData.steps.length <= 1}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 评分和点评 */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">您的评价</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                个人评分
              </label>
              <StarRating
                rating={formData.rating}
                onRatingChange={(rating) => setFormData((prev) => ({ ...prev, rating }))}
                readonly={false}
                size="lg"
              />
            </div>

            <Textarea
              label="个人点评"
              value={formData.review}
              onChange={(e) => handleInputChange('review', e.target.value)}
              placeholder="分享您对这款酒的看法..."
              rows={3}
            />
          </div>

          {/* 提交按钮 */}
          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(editId && originalRecipe ? `/recipe/${editId}` : -1)}
              disabled={loading || uploadingImage}
            >
              取消
            </Button>
            <Button type="submit" disabled={loading || uploadingImage}>
              {loading ? (editId ? '保存中...' : '发布中...') : (editId ? '保存修改' : '发布配方')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
