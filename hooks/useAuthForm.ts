'use client'

import { useState } from 'react'
import { useAuth } from './useAuth'
import { SignUpData, SignInData, ResetPasswordData, AuthResponse } from '@/lib/types/auth'
import { isValidEmail, isValidPassword, isValidUsername, isValidDisplayName } from '@/lib/utils/auth'

/**
 * 회원가입 폼 관리 훅
 */
export function useSignUpForm() {
  const { signUp } = useAuth()
  const [formData, setFormData] = useState<SignUpData>({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    displayName: ''
  })
  const [errors, setErrors] = useState<Partial<SignUpData>>({})
  const [loading, setLoading] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: Partial<SignUpData> = {}

    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요.'
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = '올바른 이메일 형식을 입력해주세요.'
    }

    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요.'
    } else if (!isValidPassword(formData.password)) {
      newErrors.password = '비밀번호는 최소 6자 이상이어야 합니다.'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호 확인을 입력해주세요.'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.'
    }

    if (!formData.username) {
      newErrors.username = '사용자명을 입력해주세요.'
    } else if (!isValidUsername(formData.username)) {
      newErrors.username = '사용자명은 3-20자의 영문, 숫자, _, -만 사용 가능합니다.'
    }

    if (!formData.displayName) {
      newErrors.displayName = '표시 이름을 입력해주세요.'
    } else if (!isValidDisplayName(formData.displayName)) {
      newErrors.displayName = '표시 이름은 1-50자여야 합니다.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (): Promise<AuthResponse> => {
    if (!validateForm()) {
      return { success: false, error: '입력 정보를 확인해주세요.' }
    }

    setLoading(true)
    try {
      const result = await signUp(formData.email, formData.password, {
        username: formData.username,
        display_name: formData.displayName
      })
      return result
    } finally {
      setLoading(false)
    }
  }

  const updateField = (field: keyof SignUpData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // 해당 필드의 에러 제거
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return {
    formData,
    errors,
    loading,
    updateField,
    handleSubmit,
    validateForm
  }
}

/**
 * 로그인 폼 관리 훅
 */
export function useSignInForm() {
  const { signIn } = useAuth()
  const [formData, setFormData] = useState<SignInData>({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState<Partial<SignInData>>({})
  const [loading, setLoading] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: Partial<SignInData> = {}

    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요.'
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = '올바른 이메일 형식을 입력해주세요.'
    }

    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (): Promise<AuthResponse> => {
    if (!validateForm()) {
      return { success: false, error: '입력 정보를 확인해주세요.' }
    }

    setLoading(true)
    try {
      const result = await signIn(formData.email, formData.password)
      return result
    } finally {
      setLoading(false)
    }
  }

  const updateField = (field: keyof SignInData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return {
    formData,
    errors,
    loading,
    updateField,
    handleSubmit,
    validateForm
  }
}

/**
 * 비밀번호 재설정 폼 관리 훅
 */
export function useResetPasswordForm() {
  const { resetPassword } = useAuth()
  const [formData, setFormData] = useState<ResetPasswordData>({
    email: ''
  })
  const [errors, setErrors] = useState<Partial<ResetPasswordData>>({})
  const [loading, setLoading] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: Partial<ResetPasswordData> = {}

    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요.'
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = '올바른 이메일 형식을 입력해주세요.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (): Promise<AuthResponse> => {
    if (!validateForm()) {
      return { success: false, error: '입력 정보를 확인해주세요.' }
    }

    setLoading(true)
    try {
      const result = await resetPassword(formData.email)
      return result
    } finally {
      setLoading(false)
    }
  }

  const updateField = (field: keyof ResetPasswordData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return {
    formData,
    errors,
    loading,
    updateField,
    handleSubmit,
    validateForm
  }
}