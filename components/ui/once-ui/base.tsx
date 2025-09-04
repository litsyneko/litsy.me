"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

// Once UI 스타일의 기본 컴포넌트들

interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'column'
  gap?: string | number
  justifyContent?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
  alignItems?: 'start' | 'center' | 'end' | 'stretch'
  fillWidth?: boolean
  fillHeight?: boolean
  padding?: string | number
  paddingX?: string | number
  paddingY?: string | number
  paddingTop?: string | number
  paddingBottom?: string | number
  paddingLeft?: string | number
  paddingRight?: string | number
}

export const Flex: React.FC<FlexProps> = ({
  children,
  className,
  direction = 'row',
  gap,
  justifyContent = 'start',
  alignItems = 'start',
  fillWidth = false,
  fillHeight = false,
  padding,
  paddingX,
  paddingY,
  paddingTop,
  paddingBottom,
  paddingLeft,
  paddingRight,
  style,
  ...props
}) => {
  const flexStyles = {
    display: 'flex',
    flexDirection: direction,
    gap: gap ? (typeof gap === 'number' ? `${gap}px` : gap) : undefined,
    justifyContent: {
      start: 'flex-start',
      center: 'center',
      end: 'flex-end',
      between: 'space-between',
      around: 'space-around',
      evenly: 'space-evenly'
    }[justifyContent],
    alignItems: {
      start: 'flex-start',
      center: 'center',
      end: 'flex-end',
      stretch: 'stretch'
    }[alignItems],
    width: fillWidth ? '100%' : undefined,
    height: fillHeight ? '100%' : undefined,
    padding: padding ? (typeof padding === 'number' ? `${padding}px` : padding) : undefined,
    paddingLeft: paddingX ? (typeof paddingX === 'number' ? `${paddingX}px` : paddingX) : 
                 paddingLeft ? (typeof paddingLeft === 'number' ? `${paddingLeft}px` : paddingLeft) : undefined,
    paddingRight: paddingX ? (typeof paddingX === 'number' ? `${paddingX}px` : paddingX) : 
                  paddingRight ? (typeof paddingRight === 'number' ? `${paddingRight}px` : paddingRight) : undefined,
    paddingTop: paddingY ? (typeof paddingY === 'number' ? `${paddingY}px` : paddingY) : 
                paddingTop ? (typeof paddingTop === 'number' ? `${paddingTop}px` : paddingTop) : undefined,
    paddingBottom: paddingY ? (typeof paddingY === 'number' ? `${paddingY}px` : paddingY) : 
                   paddingBottom ? (typeof paddingBottom === 'number' ? `${paddingBottom}px` : paddingBottom) : undefined,
    ...style
  }

  return (
    <div className={className} style={flexStyles} {...props}>
      {children}
    </div>
  )
}

// Once UI 스타일의 Grid 컴포넌트
interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: number | string
  gap?: string | number
  fillWidth?: boolean
  padding?: string | number
  paddingX?: string | number
  paddingY?: string | number
}

export const Grid: React.FC<GridProps> = ({
  children,
  className,
  columns = 'auto',
  gap = '1rem',
  fillWidth = false,
  padding,
  paddingX,
  paddingY,
  style,
  ...props
}) => {
  const gridStyles = {
    display: 'grid',
    gridTemplateColumns: typeof columns === 'number' ? `repeat(${columns}, 1fr)` : columns,
    gap: typeof gap === 'number' ? `${gap}px` : gap,
    width: fillWidth ? '100%' : undefined,
    padding: padding ? (typeof padding === 'number' ? `${padding}px` : padding) : undefined,
    paddingLeft: paddingX ? (typeof paddingX === 'number' ? `${paddingX}px` : paddingX) : undefined,
    paddingRight: paddingX ? (typeof paddingX === 'number' ? `${paddingX}px` : paddingX) : undefined,
    paddingTop: paddingY ? (typeof paddingY === 'number' ? `${paddingY}px` : paddingY) : undefined,
    paddingBottom: paddingY ? (typeof paddingY === 'number' ? `${paddingY}px` : paddingY) : undefined,
    ...style
  }

  return (
    <div className={className} style={gridStyles} {...props}>
      {children}
    </div>
  )
}

// Once UI 스타일의 Text 컴포넌트
interface TextProps extends React.HTMLAttributes<HTMLElement> {
  as?: 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  variant?: 'display' | 'heading' | 'title' | 'body' | 'label' | 'caption'
  size?: 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl'
  weight?: 'normal' | 'medium' | 'semibold' | 'bold'
  align?: 'left' | 'center' | 'right'
  onBackground?: 'neutral-strong' | 'neutral-medium' | 'neutral-weak' | 'brand-medium' | 'brand-strong'
  wrap?: 'balance' | 'pretty' | 'nowrap'
}

export const Text: React.FC<TextProps> = ({
  children,
  className,
  as = 'p',
  variant = 'body',
  size = 'm',
  weight = 'normal',
  align = 'left',
  onBackground = 'neutral-strong',
  wrap,
  style,
  ...props
}) => {
  const Component = as
  
  const textClasses = cn(
    // Base styles
    'transition-colors duration-200',
    
    // Variant styles
    {
      'text-4xl md:text-6xl': variant === 'display',
      'text-2xl md:text-4xl': variant === 'heading',
      'text-xl md:text-2xl': variant === 'title',
      'text-base': variant === 'body',
      'text-sm': variant === 'label',
      'text-xs': variant === 'caption'
    },
    
    // Size overrides
    {
      'text-xs': size === 'xs',
      'text-sm': size === 's',
      'text-base': size === 'm',
      'text-lg': size === 'l',
      'text-xl': size === 'xl',
      'text-2xl': size === 'xxl'
    },
    
    // Weight
    {
      'font-normal': weight === 'normal',
      'font-medium': weight === 'medium',
      'font-semibold': weight === 'semibold',
      'font-bold': weight === 'bold'
    },
    
    // Alignment
    {
      'text-left': align === 'left',
      'text-center': align === 'center',
      'text-right': align === 'right'
    },
    
    // Background colors
    {
      'text-foreground': onBackground === 'neutral-strong',
      'text-muted-foreground': onBackground === 'neutral-medium' || onBackground === 'neutral-weak',
      'text-primary': onBackground === 'brand-medium' || onBackground === 'brand-strong'
    },
    
    // Text wrapping
    {
      'text-balance': wrap === 'balance',
      'text-pretty': wrap === 'pretty',
      'whitespace-nowrap': wrap === 'nowrap'
    },
    
    className
  )

  return (
    <Component className={textClasses} style={style} {...props}>
      {children}
    </Component>
  )
}

// Once UI 스타일의 RevealFx 애니메이션 컴포넌트
interface RevealFxProps {
  children: React.ReactNode
  delay?: number
  translateY?: number
  className?: string
}

export const RevealFx: React.FC<RevealFxProps> = ({
  children,
  delay = 0,
  translateY = 0.5,
  className
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: `${translateY}rem` }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.6, 
        delay,
        ease: [0.23, 1, 0.32, 1] // Once UI의 easing 커브
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
