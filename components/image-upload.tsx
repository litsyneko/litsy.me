"use client"

import React, { useState, useRef, useCallback } from "react"
import ReactCrop, { 
  type Crop, 
  type PixelCrop,
  centerCrop,
  makeAspectCrop
} from "react-image-crop"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Camera, 
  Upload, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Check, 
  X,
  AlertCircle,
  Image as ImageIcon,
  RotateCw,
  Move
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/AuthContext"
import "react-image-crop/dist/ReactCrop.css"

interface ImageUploadProps {
  currentImageUrl?: string
  onImageUpdate?: (url: string) => void
}

// 이미지 크롭 및 리사이즈 유틸리티 함수
function getCroppedImg(
  image: HTMLImageElement,
  crop: PixelCrop,
  scale = 1,
  rotate = 0
): Promise<Blob> {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('No 2d context')
  }

  const scaleX = image.naturalWidth / image.width
  const scaleY = image.naturalHeight / image.height
  const pixelRatio = window.devicePixelRatio

  canvas.width = Math.floor(crop.width * scaleX * pixelRatio)
  canvas.height = Math.floor(crop.height * scaleY * pixelRatio)

  ctx.scale(pixelRatio, pixelRatio)
  ctx.imageSmoothingQuality = 'high'

  const cropX = crop.x * scaleX
  const cropY = crop.y * scaleY

  const centerX = image.naturalWidth / 2
  const centerY = image.naturalHeight / 2

  ctx.save()

  ctx.translate(-cropX, -cropY)
  ctx.translate(centerX, centerY)
  ctx.rotate((rotate * Math.PI) / 180)
  ctx.scale(scale, scale)
  ctx.translate(-centerX, -centerY)
  ctx.drawImage(
    image,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight
  )

  ctx.restore()

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          throw new Error('Canvas is empty')
        }
        resolve(blob)
      },
      'image/jpeg',
      0.9
    )
  })
}

export default function ImageUpload({ currentImageUrl, onImageUpdate }: ImageUploadProps) {
  const { user, refreshUser } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [imgSrc, setImgSrc] = useState('')
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [scale, setScale] = useState(1)
  const [rotate, setRotate] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')

  const imgRef = useRef<HTMLImageElement>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)
  const hiddenFileInput = useRef<HTMLInputElement>(null)

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      
      // 파일 크기 체크 (5MB 제한)
      if (file.size > 5 * 1024 * 1024) {
        setError('파일 크기는 5MB 이하여야 합니다.')
        return
      }

      // 파일 타입 체크
      if (!file.type.startsWith('image/')) {
        setError('이미지 파일만 업로드할 수 있습니다.')
        return
      }

      setError(null)
      const reader = new FileReader()
      reader.addEventListener('load', () => {
        const imageUrl = reader.result?.toString() || ''
        setImgSrc(imageUrl)
        setIsOpen(true)
      })
      reader.readAsDataURL(file)
    }
  }

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 80,
        },
        1, // aspect ratio (1:1 for square)
        width,
        height
      ),
      width,
      height
    )
    setCrop(crop)
  }, [])

  // 미리보기 업데이트
  const updatePreview = useCallback(() => {
    if (!completedCrop || !imgRef.current || !previewCanvasRef.current) {
      return
    }

    const image = imgRef.current
    const canvas = previewCanvasRef.current
    const crop = completedCrop

    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height
    const ctx = canvas.getContext('2d')

    if (!ctx) return

    canvas.width = 200
    canvas.height = 200

    ctx.imageSmoothingQuality = 'high'

    const cropX = crop.x * scaleX
    const cropY = crop.y * scaleY
    const cropWidth = crop.width * scaleX
    const cropHeight = crop.height * scaleY

    const centerX = image.naturalWidth / 2
    const centerY = image.naturalHeight / 2

    ctx.save()
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // 원형 마스크
    ctx.beginPath()
    ctx.arc(100, 100, 100, 0, 2 * Math.PI)
    ctx.clip()

    ctx.translate(100, 100)
    ctx.rotate((rotate * Math.PI) / 180)
    ctx.scale(scale, scale)
    ctx.translate(-100, -100)

    const drawWidth = (cropWidth / cropWidth) * 200
    const drawHeight = (cropHeight / cropHeight) * 200
    const drawX = (200 - drawWidth) / 2
    const drawY = (200 - drawHeight) / 2

    ctx.drawImage(
      image,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      drawX,
      drawY,
      drawWidth,
      drawHeight
    )

    ctx.restore()

    // 미리보기 URL 생성
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob)
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl)
        }
        setPreviewUrl(url)
      }
    })
  }, [completedCrop, scale, rotate, previewUrl])

  // 크롭이나 변환이 변경될 때마다 미리보기 업데이트
  React.useEffect(() => {
    updatePreview()
  }, [updatePreview])

  const handleUpload = async () => {
    if (!completedCrop || !imgRef.current || !user) return

    setUploading(true)
    setError(null)

    try {
      // 1. 기존 아바타들 모두 삭제 (새 파일 업로드 전에)
      await cleanupOldAvatars()

      // 2. 새 이미지 크롭 및 처리
      const croppedImageBlob = await getCroppedImg(
        imgRef.current,
        completedCrop,
        scale,
        rotate
      )

      // 3. Supabase Storage에 업로드 (사용자 폴더에 저장)
      const fileName = `${user.id}/avatar-${Date.now()}.jpg`
      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, croppedImageBlob, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        throw uploadError
      }

      // 4. 공개 URL 가져오기
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      // 5. 사용자 메타데이터 업데이트
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          avatar_url: publicUrl
        }
      })

      if (updateError) {
        throw updateError
      }

      // 6. 사용자 정보 새로고침 및 콜백 호출
      await refreshUser()
      onImageUpdate?.(publicUrl)
      handleCancel()

    } catch (err: any) {
      console.error('Upload error:', err)
      setError(err.message || '이미지 업로드 중 오류가 발생했습니다.')
    } finally {
      setUploading(false)
    }
  }

  // 기존 아바타들을 정리하는 함수
  const cleanupOldAvatars = async () => {
    if (!user) return

    try {
      // 사용자 폴더의 모든 파일 조회
      const { data: files, error: listError } = await supabase.storage
        .from('avatars')
        .list(user.id, {
          limit: 100,
          sortBy: { column: 'name', order: 'desc' }
        })

      if (listError) {
        console.warn('Failed to list old avatars:', listError)
        return
      }

      if (files && files.length > 0) {
        // 모든 기존 아바타 파일 삭제
        const filesToDelete = files.map(file => `${user.id}/${file.name}`)
        
        console.log('Deleting old avatars:', filesToDelete)
        const { error: deleteError } = await supabase.storage
          .from('avatars')
          .remove(filesToDelete)

        if (deleteError) {
          console.warn('Failed to delete some old avatars:', deleteError)
        } else {
          console.log('Successfully deleted old avatars:', filesToDelete.length)
        }
      }
    } catch (err) {
      console.warn('Error during avatar cleanup:', err)
      // 정리 실패해도 업로드는 계속 진행
    }
  }

  const handleCancel = () => {
    setIsOpen(false)
    setImgSrc('')
    setCrop(undefined)
    setCompletedCrop(undefined)
    setScale(1)
    setRotate(0)
    setError(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl('')
    }
  }

  const handleFileInputClick = () => {
    hiddenFileInput.current?.click()
  }

  const resetTransforms = () => {
    setScale(1)
    setRotate(0)
  }

  return (
    <>
      <input
        ref={hiddenFileInput}
        type="file"
        accept="image/*"
        onChange={onSelectFile}
        style={{ display: 'none' }}
      />
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
            onClick={handleFileInputClick}
          >
            <Camera className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5" />
              <span>프로필 이미지 편집</span>
            </DialogTitle>
            <DialogDescription>
              이미지를 크롭하고 크기와 회전을 조정하세요
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert className="!flex !items-center !gap-3 !grid-cols-none border-red-500">
              <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
              <AlertDescription className="!col-start-auto !text-foreground">{error}</AlertDescription>
            </Alert>
          )}

          {imgSrc && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 메인 편집 영역 */}
              <div className="lg:col-span-2 space-y-4">
                <div className="relative bg-muted rounded-lg p-4">
                  <ReactCrop
                    crop={crop}
                    onChange={(_, percentCrop) => setCrop(percentCrop)}
                    onComplete={(c) => setCompletedCrop(c)}
                    aspect={1}
                    circularCrop
                    className="max-h-96"
                  >
                    <img
                      ref={imgRef}
                      alt="편집할 이미지"
                      src={imgSrc}
                      style={{ 
                        transform: `scale(${scale}) rotate(${rotate}deg)`,
                        maxHeight: '400px',
                        width: 'auto',
                        maxWidth: '100%'
                      }}
                      onLoad={onImageLoad}
                    />
                  </ReactCrop>
                </div>

                {/* 컨트롤 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center space-x-2">
                      <ZoomIn className="h-4 w-4" />
                      <span>크기: {Math.round(scale * 100)}%</span>
                    </Label>
                    <Slider
                      value={[scale]}
                      onValueChange={(value) => setScale(value[0])}
                      min={0.5}
                      max={3}
                      step={0.1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center space-x-2">
                      <RotateCcw className="h-4 w-4" />
                      <span>회전: {rotate}°</span>
                    </Label>
                    <Slider
                      value={[rotate]}
                      onValueChange={(value) => setRotate(value[0])}
                      min={-180}
                      max={180}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* 빠른 조정 버튼 */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRotate(rotate - 90)}
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    90° 좌회전
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRotate(rotate + 90)}
                  >
                    <RotateCw className="h-4 w-4 mr-1" />
                    90° 우회전
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetTransforms}
                  >
                    <Move className="h-4 w-4 mr-1" />
                    초기화
                  </Button>
                </div>
              </div>

              {/* 미리보기 및 액션 */}
              <div className="space-y-4">
                <div className="space-y-3">
                  <Label className="text-sm font-medium">미리보기</Label>
                  <div className="flex justify-center">
                    <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-muted bg-muted">
                      <canvas
                        ref={previewCanvasRef}
                        className="w-full h-full"
                        width={200}
                        height={200}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div className="flex items-center space-x-2">
                      <ImageIcon className="h-4 w-4" />
                      <span>원본 크기</span>
                    </div>
                    <div className="text-xs">
                      {imgRef.current?.naturalWidth}×{imgRef.current?.naturalHeight}px
                    </div>
                  </div>
                  
                  {completedCrop && (
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex items-center space-x-2">
                        <Camera className="h-4 w-4" />
                        <span>크롭 영역</span>
                      </div>
                      <div className="text-xs">
                        {Math.round(completedCrop.width)}×{Math.round(completedCrop.height)}px
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col space-y-2">
                  <Button 
                    onClick={handleUpload} 
                    disabled={!completedCrop || uploading}
                    className="w-full"
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        업로드 중...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        저장
                      </>
                    )}
                  </Button>
                  
                  <Button variant="outline" onClick={handleCancel} className="w-full">
                    <X className="h-4 w-4 mr-2" />
                    취소
                  </Button>
                </div>
              </div>
            </div>
          )}

          {!imgSrc && (
            <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-muted rounded-lg">
              <Camera className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">이미지를 선택하세요</h3>
              <p className="text-muted-foreground text-center mb-4">
                JPG, PNG 형식의 이미지 (최대 5MB)
              </p>
              <Button onClick={handleFileInputClick}>
                <Upload className="h-4 w-4 mr-2" />
                파일 선택
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
