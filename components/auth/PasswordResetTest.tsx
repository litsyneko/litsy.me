'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  canRequestPasswordReset, 
  sendPasswordResetEmail, 
  getPasswordResetStats,
  checkPasswordStrength 
} from '@/lib/utils/password-reset'
import { Loader2, CheckCircle, AlertCircle, Info } from 'lucide-react'

export default function PasswordResetTest() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)

  const handleCheckEligibility = async () => {
    if (!email) return
    
    setLoading(true)
    try {
      const eligibility = await canRequestPasswordReset(email)
      setResult({
        type: 'eligibility',
        data: eligibility
      })
    } catch (error) {
      setResult({
        type: 'error',
        message: '확인 중 오류가 발생했습니다.'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSendReset = async () => {
    if (!email) return
    
    setLoading(true)
    try {
      const result = await sendPasswordResetEmail(email)
      setResult({
        type: 'reset',
        data: result
      })
    } catch (error) {
      setResult({
        type: 'error',
        message: '전송 중 오류가 발생했습니다.'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGetStats = async () => {
    setLoading(true)
    try {
      const statsData = await getPasswordResetStats()
      setStats(statsData)
    } catch (error) {
      setResult({
        type: 'error',
        message: '통계 조회 중 오류가 발생했습니다.'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCheckPassword = () => {
    if (!password) return
    
    const strength = checkPasswordStrength(password)
    setResult({
      type: 'password',
      data: strength
    })
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>비밀번호 재설정 기능 테스트</CardTitle>
          <CardDescription>
            개선된 비밀번호 재설정 기능을 테스트해보세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="test-email">이메일</Label>
            <Input
              id="test-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="테스트할 이메일을 입력하세요"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="test-password">비밀번호 (강도 테스트용)</Label>
            <Input
              id="test-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호 강도를 테스트할 비밀번호"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={handleCheckEligibility} 
              disabled={loading || !email}
              variant="outline"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              요청 가능 여부 확인
            </Button>

            <Button 
              onClick={handleSendReset} 
              disabled={loading || !email}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              재설정 이메일 발송
            </Button>

            <Button 
              onClick={handleGetStats} 
              disabled={loading}
              variant="outline"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              통계 조회
            </Button>

            <Button 
              onClick={handleCheckPassword} 
              disabled={!password}
              variant="outline"
            >
              비밀번호 강도 확인
            </Button>
          </div>

          {result && (
            <Alert className={
              result.type === 'error' 
                ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950'
                : 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950'
            }>
              {result.type === 'error' ? (
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              ) : (
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              )}
              <AlertDescription>
                <div className="space-y-2">
                  <div className="font-medium">
                    {result.type === 'eligibility' && '요청 가능 여부'}
                    {result.type === 'reset' && '재설정 이메일 발송 결과'}
                    {result.type === 'password' && '비밀번호 강도 분석'}
                    {result.type === 'error' && '오류'}
                  </div>
                  
                  {result.type === 'eligibility' && (
                    <div className="text-sm">
                      <p>가능 여부: {result.data.canRequest ? '✅ 가능' : '❌ 불가능'}</p>
                      <p>사유: {result.data.reason}</p>
                      {result.data.waitTimeMinutes > 0 && (
                        <p>대기 시간: {result.data.waitTimeMinutes}분</p>
                      )}
                    </div>
                  )}
                  
                  {result.type === 'reset' && (
                    <div className="text-sm">
                      <p>성공 여부: {result.data.success ? '✅ 성공' : '❌ 실패'}</p>
                      <p>메시지: {result.data.message}</p>
                      {result.data.canRetryAt && (
                        <p>재시도 가능 시간: {result.data.canRetryAt.toLocaleString()}</p>
                      )}
                    </div>
                  )}
                  
                  {result.type === 'password' && (
                    <div className="text-sm">
                      <p>강도 점수: {result.data.score}/5</p>
                      <p>강력함: {result.data.isStrong ? '✅ 강력함' : '❌ 약함'}</p>
                      {result.data.feedback.length > 0 && (
                        <div>
                          <p>개선 사항:</p>
                          <ul className="list-disc list-inside ml-2">
                            {result.data.feedback.map((feedback: string, index: number) => (
                              <li key={index}>{feedback}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {result.type === 'error' && (
                    <p className="text-sm">{result.message}</p>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {stats && (
            <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription>
                <div className="space-y-2">
                  <div className="font-medium">비밀번호 재설정 통계 (최근 30일)</div>
                  <div className="text-sm">
                    <p>총 요청 수: {stats.totalRequests}</p>
                    <p>성공한 요청: {stats.successfulRequests}</p>
                    <p>실패한 요청: {stats.failedRequests}</p>
                    <p>마지막 요청: {stats.lastRequestAt ? new Date(stats.lastRequestAt).toLocaleString() : '없음'}</p>
                    <p>마지막 성공: {stats.lastSuccessAt ? new Date(stats.lastSuccessAt).toLocaleString() : '없음'}</p>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}