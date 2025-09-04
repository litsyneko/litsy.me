"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Flex, Text } from './base'

// Once UI 스타일의 Card 컴포넌트
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'elevated' | 'outlined' | 'filled'
  padding?: string | number
  radius?: 'none' | 's' | 'm' | 'l' | 'xl'
  fillWidth?: boolean
  href?: string
  hoverable?: boolean
  border?: string
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'elevated',
  padding = 24,
  radius = 'l',
  fillWidth = false,
  href,
  hoverable = true,
  border,
  style,
  onClick,
  ...props
}) => {
  const cardClasses = cn(
    'transition-all duration-300 ease-out',
    
    // Variants
    {
      'bg-card shadow-lg hover:shadow-xl': variant === 'elevated',
      'bg-card border border-border': variant === 'outlined',
      'bg-card/80 backdrop-blur-sm': variant === 'filled'
    },
    
    // Radius
    {
      'rounded-none': radius === 'none',
      'rounded-sm': radius === 's',
      'rounded-md': radius === 'm',
      'rounded-lg': radius === 'l',
      'rounded-xl': radius === 'xl'
    },
    
    // Fill width
    {
      'w-full': fillWidth
    },
    
    // Hover effects
    {
      'hover:scale-[1.02] hover:-translate-y-1 cursor-pointer': hoverable && (href || onClick)
    },
    
    className
  )
  
  const cardStyles = {
    padding: typeof padding === 'number' ? `${padding}px` : padding,
    borderColor: border,
    ...style
  }

  if (href) {
    return (
      <motion.div 
        className={cardClasses} 
        style={cardStyles} 
        whileHover={hoverable ? { scale: 1.02, y: -4 } : undefined}
        whileTap={hoverable ? { scale: 0.98 } : undefined}
        onClick={() => window.open(href, '_blank')}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <motion.div 
      className={cardClasses} 
      style={cardStyles} 
      onClick={onClick}
      whileHover={hoverable ? { scale: 1.02, y: -4 } : undefined}
      whileTap={hoverable ? { scale: 0.98 } : undefined}
    >
      {children}
    </motion.div>
  )
}

// Once UI 스타일의 Background 컴포넌트
interface BackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  gradient?: {
    display: boolean
    opacity?: number
  }
  dots?: {
    display: boolean
    opacity?: number
  }
  lines?: {
    display: boolean
    opacity?: number
  }
}

export const Background: React.FC<BackgroundProps> = ({
  children,
  className,
  gradient,
  dots,
  lines,
  style,
  ...props
}) => {
  return (
    <div className={cn('relative', className)} style={style} {...props}>
      {/* Gradient background */}
      {gradient?.display && (
        <div 
          className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5"
          style={{ opacity: gradient.opacity || 0.5 }}
        />
      )}
      
      {/* Dots pattern */}
      {dots?.display && (
        <div 
          className="absolute inset-0"
          style={{
            opacity: dots.opacity || 0.3,
            backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
            backgroundSize: '32px 32px'
          }}
        />
      )}
      
      {/* Lines pattern */}
      {lines?.display && (
        <div 
          className="absolute inset-0"
          style={{
            opacity: lines.opacity || 0.1,
            backgroundImage: `
              linear-gradient(currentColor 1px, transparent 1px),
              linear-gradient(90deg, currentColor 1px, transparent 1px)
            `,
            backgroundSize: '32px 32px'
          }}
        />
      )}
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

// Once UI 스타일의 Avatar 컴포넌트
interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string
  alt?: string
  size?: 'xs' | 's' | 'm' | 'l' | 'xl'
  fallback?: string
  variant?: 'circle' | 'square'
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  size = 'm',
  fallback,
  variant = 'circle',
  className,
  style,
  ...props
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    s: 'w-8 h-8 text-sm',
    m: 'w-10 h-10 text-base',
    l: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl'
  }
  
  const avatarClasses = cn(
    'flex items-center justify-center overflow-hidden bg-muted text-muted-foreground font-medium',
    sizeClasses[size],
    {
      'rounded-full': variant === 'circle',
      'rounded-lg': variant === 'square'
    },
    className
  )

  return (
    <div className={avatarClasses} style={style} {...props}>
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <span>{fallback || '?'}</span>
      )}
    </div>
  )
}

// Once UI 스타일의 Badge 컴포넌트
interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'brand'
  size?: 'xs' | 's' | 'm'
  title: string
  icon?: React.ReactNode
  href?: string
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 's',
  title,
  icon,
  href,
  className,
  onClick,
  ...props
}) => {
  const badgeClasses = cn(
    'inline-flex items-center gap-1.5 font-medium transition-colors duration-200',
    
    // Sizes
    {
      'px-2 py-1 text-xs': size === 'xs',
      'px-3 py-1.5 text-sm': size === 's',
      'px-4 py-2 text-base': size === 'm'
    },
    
    // Variants
    {
      'bg-secondary text-secondary-foreground hover:bg-secondary/80': variant === 'default',
      'bg-muted text-muted-foreground hover:bg-muted/80': variant === 'secondary',
      'border border-border text-foreground hover:bg-accent': variant === 'outline',
      'bg-primary text-primary-foreground hover:bg-primary/90': variant === 'brand'
    },
    
    'rounded-full',
    
    {
      'cursor-pointer': href || onClick
    },
    
    className
  )

  const handleClick = href ? () => window.open(href, '_blank') : onClick

  return (
    <div className={badgeClasses} onClick={handleClick} {...props}>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{title}</span>
    </div>
  )
}

// Once UI 스타일의 Row (수평 레이아웃) 컴포넌트
interface RowProps extends React.HTMLAttributes<HTMLDivElement> {
  gap?: string | number
  paddingX?: string | number
  paddingY?: string | number
  fillWidth?: boolean
  justifyContent?: 'start' | 'center' | 'end' | 'between' | 'around'
  alignItems?: 'start' | 'center' | 'end' | 'stretch'
}

export const Row: React.FC<RowProps> = ({
  children,
  className,
  gap = 16,
  paddingX,
  paddingY,
  fillWidth = false,
  justifyContent = 'start',
  alignItems = 'center',
  style,
  ...props
}) => {
  return (
    <Flex
      direction="row"
      gap={gap}
      paddingX={paddingX}
      paddingY={paddingY}
      fillWidth={fillWidth}
      justifyContent={justifyContent}
      alignItems={alignItems}
      className={className}
      style={style}
      {...props}
    >
      {children}
    </Flex>
  )
}

// Once UI 스타일의 Column (수직 레이아웃) 컴포넌트
interface ColumnProps extends React.HTMLAttributes<HTMLDivElement> {
  gap?: string | number
  paddingX?: string | number
  paddingY?: string | number
  fillWidth?: boolean
  justifyContent?: 'start' | 'center' | 'end' | 'between' | 'around'
  alignItems?: 'start' | 'center' | 'end' | 'stretch'
}

export const Column: React.FC<ColumnProps> = ({
  children,
  className,
  gap = 16,
  paddingX,
  paddingY,
  fillWidth = false,
  justifyContent = 'start',
  alignItems = 'start',
  style,
  ...props
}) => {
  return (
    <Flex
      direction="column"
      gap={gap}
      paddingX={paddingX}
      paddingY={paddingY}
      fillWidth={fillWidth}
      justifyContent={justifyContent}
      alignItems={alignItems}
      className={className}
      style={style}
      {...props}
    >
      {children}
    </Flex>
  )
}
