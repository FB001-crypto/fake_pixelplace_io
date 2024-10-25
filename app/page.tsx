'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Menu, Info, Minus, Plus } from 'lucide-react'
import { toast, Toaster } from 'react-hot-toast'
import ChatBox from '@/components/Chat/ChatBox'
import { ChatProvider } from '@/context/ChatContext'

// 定义颜色数组，每个颜色包含十六进制值和名称
const COLORS = [
  { hex: '#FF0000', name: '红色' },
  { hex: '#FFA500', name: '橙色' },
  { hex: '#FFFF00', name: '黄色' },
  { hex: '#008000', name: '绿色' },
  { hex: '#0000FF', name: '蓝色' },
  { hex: '#800080', name: '紫色' },
  { hex: '#FFC0CB', name: '粉红色' },
  { hex: '#A52A2A', name: '褐色' },
  { hex: '#FFFFFF', name: '白色' },
  { hex: '#000000', name: '黑色' },
  { hex: '#808080', name: '灰色' },
  { hex: '#FFD700', name: '金色' },
  { hex: '#00FFFF', name: '青色' },
  { hex: '#FF00FF', name: '品红色' },
  { hex: '#008080', name: '青绿色' },
  { hex: '#800000', name: '栗色' },
  { hex: '#FF4500', name: '橘红色' },
  { hex: '#9ACD32', name: '黄绿色' },
  { hex: '#4B0082', name: '靛青色' },
  { hex: '#F0E68C', name: '卡其色' },
  { hex: '#E6E6FA', name: '淡紫色' },
  { hex: '#D2691E', name: '巧克力色' },
  { hex: '#B0C4DE', name: '亮钢蓝' },
  { hex: '#32CD32', name: '酸橙色' }
]
const MAX_PIXELS = 15 // 最大像素数量
const TIME_LIMIT = 60000 // 60秒，以毫秒为单位

export default function PixelArtApp() {
  const [color, setColor] = useState('#000000') // 当前选择的颜色
  const [zoom, setZoom] = useState(1) // 缩放比例
  const canvasRef = useRef<HTMLCanvasElement>(null) // 画布引用
  const containerRef = useRef<HTMLDivElement>(null) // 画布容器引用
  const [canvasSize] = useState({ width: 800, height: 600 }) // 画布尺寸
  const [pixels, setPixels] = useState<Array<{x: number, y: number, color: string}>>([]) // 像素数组
  const [remainingPixels, setRemainingPixels] = useState(MAX_PIXELS) // 剩余像素数量
  const [nextPixelTime, setNextPixelTime] = useState<number>(5) // 5秒倒计时
  const [backgroundLoaded, setBackgroundLoaded] = useState(false) // 背景是否加载完成
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null) // 背景图片
  const [isDragging, setIsDragging] = useState(false) // 是否正在拖拽
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 }) // 拖拽起始位置
  const [offset, setOffset] = useState({ x: 0, y: 0 }) // 画布偏移量
  const [isDrawMode, setIsDrawMode] = useState(true) // 是否为绘画模式
  const [pixelCount, setPixelCount] = useState<number>(15) // 当前可用像素数量
  const maxPixelCount = 15 // 最大像素数量
  const minPixelCount = 0 // 最小像素数量
  const drawCooldown = 100 // 100ms冷却时间
  const [lastDrawTime, setLastDrawTime] = useState<number>(0) // 上次绘制时间

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = canvasSize.width
    canvas.height = canvasSize.height

    // 只在首次加载背景图片
    if (!backgroundLoaded) {
      const img = new Image()
      img.src = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sr2c47d26d67faws3-goVCIQua6tNtaDvimx9WmAhkZddB4U.png'
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        setBackgroundLoaded(true)
        setBackgroundImage(img)
      }
    } else if (backgroundImage) {
      ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height)
    }

    // 绘制像素
    pixels.forEach(pixel => {
      ctx.fillStyle = pixel.color
      ctx.fillRect(pixel.x, pixel.y, 1, 1)
    })
  }, [canvasSize, pixels, backgroundImage, backgroundLoaded])

  // 修改计时器逻辑
  useEffect(() => {
    const timer = setInterval(() => {
      setNextPixelTime(prev => {
        let updatedPixelCount = pixelCount; // 使用本地变量存储当前像素数量

        if (updatedPixelCount >= maxPixelCount) {
          return 0; // 当像素达到最大值时，显示为 0
        }

        if (prev <= 1) {
          // 当倒计时结束时
          if (updatedPixelCount < maxPixelCount) {
            updatedPixelCount++; // 增加一个像素
            setPixelCount(updatedPixelCount); // 更新状态
          }
          return 5; // 重置为5秒
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [pixelCount, maxPixelCount]);

  // 添加新的 useEffect 来处理像素数量变化
  useEffect(() => {
    if (pixelCount < maxPixelCount && nextPixelTime === 0) {
      // 如果像素数量从最大值减少，重置计时器
      setNextPixelTime(5);
    }
  }, [pixelCount, maxPixelCount, nextPixelTime]);

  const handleZoom = useCallback((direction: number) => {
    setZoom(prevZoom => {
      const newZoom = Math.max(0.1, Math.min(10, prevZoom + direction * 0.1))
      const container = containerRef.current
      const canvas = canvasRef.current
      if (container && canvas) {
        const containerRect = container.getBoundingClientRect()
        const mouseX = containerRect.width / 2
        const mouseY = containerRect.height / 2
        const zoomFactor = newZoom / prevZoom
        setOffset(prev => ({
          x: (mouseX - (mouseX - prev.x) * zoomFactor),
          y: (mouseY - (mouseY - prev.y) * zoomFactor)
        }))
      }
      return newZoom
    })
  }, [])

  const handleDraw = useCallback((clientX: number, clientY: number) => {
    const now = Date.now();
    if (now - lastDrawTime < drawCooldown) {
      return; // 如果在冷却时间内，直接返回
    }

    if (pixelCount <= minPixelCount) {
      toast.error('没有可用的像素！请等待。');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvasSize.width / rect.width;
    const scaleY = canvasSize.height / rect.height;
    const canvasX = Math.floor((clientX - rect.left) * scaleX);
    const canvasY = Math.floor((clientY - rect.top) * scaleY);

    if (canvasX >= 0 && canvasX < canvasSize.width && canvasY >= 0 && canvasY < canvasSize.height) {
      setPixels(prevPixels => {
        const newPixels = prevPixels.filter(p => p.x !== canvasX || p.y !== canvasY);
        return [...newPixels, { x: canvasX, y: canvasY, color }];
      });
      setPixelCount(prevCount => {
        const newCount = Math.max(prevCount - 1, minPixelCount);
        if (newCount < maxPixelCount && prevCount === maxPixelCount) {
          // 如果从最大值减少，重置计时器
          setNextPixelTime(5);
        }
        return newCount;
      });
      setLastDrawTime(now); // 更新最后绘制时间
    }
  }, [color, pixelCount, lastDrawTime, drawCooldown, canvasSize, minPixelCount, maxPixelCount]);

  const handleMouseDown = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (isDrawMode) {
      handleDraw(event.clientX, event.clientY)
    } else {
      setIsDragging(true)
      setDragStart({ x: event.clientX - offset.x, y: event.clientY - offset.y })
    }
  }, [isDrawMode, handleDraw, offset])

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging && !isDrawMode) {
      setOffset({
        x: event.clientX - dragStart.x,
        y: event.clientY - dragStart.y
      })
    }
  }, [isDragging, isDrawMode, dragStart])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (isDrawMode) {
      handleDraw(event.clientX, event.clientY)
    }
  }, [isDrawMode, handleDraw])

  const toggleDrawMode = useCallback(() => {
    setIsDrawMode(prev => !prev)
  }, [])

  return (
    <ChatProvider>
      <div className="flex flex-col h-screen bg-gradient-to-r from-purple-900 via-indigo-900 to-teal-800 text-white font-sans">
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=ZCOOL+QingKe+HuangYou&display=swap');

          body, button, input {
            font-family: "ZCOOL QingKe HuangYou", sans-serif;
            font-weight: 400;
            font-style: normal;
          }
          body {
            background-image: 
              linear-gradient(to right, #4a0e4e, #170b3b, #0e3a4d),
              url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cpolygon points='0,0 100,0 50,100' fill='rgba(255,255,255,0.1)'/%3E%3C/svg%3E");
            background-size: cover, 100px 100px;
            background-blend-mode: normal, overlay;
          }
        `}</style>
        <header className="flex justify-between items-center p-4 bg-black bg-opacity-30 backdrop-filter backdrop-blur-md">
          <Button variant="ghost" size="icon" className="text-white hover:text-teal-300 transition-colors"><Menu /></Button>
          <h1 className="text-2xl font-bold tracking-wide" style={{ fontFamily: '"ZCOOL QingKe HuangYou", sans-serif' }}>像素艺术创作</h1>
          <Button variant="ghost" size="icon" className="text-white hover:text-teal-300 transition-colors"><Info /></Button>
        </header>
        
        <main className="flex-grow overflow-hidden relative flex">
          {/* 计时器区域 */}
          <div className="absolute top-4 left-4 bg-black bg-opacity-50 backdrop-filter backdrop-blur-md rounded-lg p-3 text-sm" 
              style={{ fontFamily: '"ZCOOL QingKe HuangYou", sans-serif' }}>
            剩余像素: <span className="text-teal-300">{pixelCount}</span> | 
            下个像素: <span className="text-teal-300">{nextPixelTime === 0 ? '-' : `${nextPixelTime}s`}</span>
          </div>

          {/* 地图和聊天框区域 */}
          <div className="flex-grow flex">
            {/* 地图区域 */}
            <div className="flex-grow relative">
              <div 
                ref={containerRef}
                className={`absolute inset-0 flex items-center justify-center ${isDrawMode ? 'cursor-crosshair' : 'cursor-move'}`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onClick={handleClick}
              >
                <canvas 
                  ref={canvasRef}
                  style={{ 
                    transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                    transformOrigin: 'center center',
                    imageRendering: 'pixelated',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.2)',
                    borderRadius: '8px',
                  }}
                />
              </div>
              
              <Button 
                className="absolute bottom-4 right-4 bg-teal-700 hover:bg-teal-600 text-white transition-colors duration-300 shadow-lg"
                onClick={toggleDrawMode}
                style={{ fontFamily: '"ZCOOL QingKe HuangYou", sans-serif' }}
              >
                {isDrawMode ? '切换到拖拽模式' : '切换到绘画模式'}
              </Button>
            </div>

            {/* 聊天框区域 */}
            <div className="w-1/4 min-w-[300px] p-4 bg-black bg-opacity-30 backdrop-filter backdrop-blur-md">
              <ChatBox />
            </div>
          </div>
        </main>

        <footer className="p-4 bg-black bg-opacity-30 backdrop-filter backdrop-blur-md">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" onClick={() => handleZoom(-1)} className="text-white hover:text-teal-300 transition-colors"><Minus /></Button>
              <Slider 
                value={[zoom]}
                min={0.1}
                max={10}
                step={0.1}
                onValueChange={([value]) => setZoom(value)}
                className="w-32"
              />
              <Button variant="ghost" size="icon" onClick={() => handleZoom(1)} className="text-white hover:text-teal-300 transition-colors"><Plus /></Button>
            </div>
            <span className="text-sm" style={{ fontFamily: '"ZCOOL QingKe HuangYou", sans-serif' }}>
              {COLORS.find(c => c.hex === color)?.name || '未选择颜色'}
            </span>
          </div>
          <div className="flex justify-center space-x-2 p-3 bg-black bg-opacity-50 backdrop-filter backdrop-blur-md rounded-lg overflow-x-auto">
            {COLORS.map((c) => (
              <button
                key={c.hex}
                className={`w-7 h-7 rounded-full flex-shrink-0 transition-transform duration-200 hover:scale-110 ${color === c.hex ? 'ring-2 ring-teal-500 ring-opacity-70 shadow-lg' : ''}`}
                style={{ backgroundColor: c.hex }}
                onClick={() => setColor(c.hex)}
                title={c.name}
              />
            ))}
          </div>
        </footer>
        <Toaster 
          toastOptions={{
            style: {
              background: 'rgba(0, 0, 0, 0.8)',
              color: '#fff',
              fontFamily: '"ZCOOL QingKe HuangYou", sans-serif',
              backdropFilter: 'blur(10px)',
            },
          }}
        />
      </div>
    </ChatProvider>
  )
}
