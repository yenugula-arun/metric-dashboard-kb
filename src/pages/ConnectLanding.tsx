import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Server,
  Activity,
  Cpu,
  RefreshCw,
  AlertCircle,
  KeyRound,
  CheckCircle2,
  Lock,
  TrendingDown,
  Zap,
} from 'lucide-react'
import { useAWSContext } from '@/context/AWSContext'
import { EXAMPLE_ROLE_ARN } from '@/constants/aws'
import { ROUTES } from '@/constants/routes'

export default function ConnectLandingPage() {
  const navigate = useNavigate()
  const { connect, loading, error, isConnected, roleArn, connection } = useAWSContext()
  const [arnInput, setArnInput]     = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const handleConnectSuccess = () => {
    navigate(ROUTES.DASHBOARD)
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setLocalError(null)

    const trimmed = arnInput.trim()
    if (!trimmed) {
      setLocalError('Please enter a valid AWS IAM Role ARN.')
      return
    }

    setSubmitting(true)
    const success = await connect(trimmed)
    setSubmitting(false)

    if (success) {
      handleConnectSuccess()
    } else if (!error) {
      setLocalError('Unable to connect with provided Role ARN. Check IAM trust policy.')
    }
  }

  const handleUseDemo = async () => {
    setArnInput(EXAMPLE_ROLE_ARN)
    setLocalError(null)
    setSubmitting(true)
    const success = await connect(EXAMPLE_ROLE_ARN)
    setSubmitting(false)
    if (success) {
      handleConnectSuccess()
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between p-4 sm:p-8 selection:bg-blue-600 selection:text-white">
      
      {/* Top Header */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between py-3 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Cpu size={20} />
          </div>
          <div>
            <span className="font-extrabold text-base text-slate-900 tracking-tight block leading-none">KubeWise</span>
            <span className="text-[11px] text-slate-500 font-medium">EKS Metric Engine</span>
          </div>
        </div>

        {isConnected && (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-full">
              <CheckCircle2 size={13} className="text-emerald-600" />
              <span>Account {connection?.accountId ?? 'Connected'}</span>
            </div>
            <button
              onClick={() => navigate(ROUTES.DASHBOARD)}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              <span>Dashboard</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto w-full my-auto py-8 space-y-8">

        {/* Hero Section: Icon + Title + Minimal Tagline */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-blue-100/70 border border-blue-200 text-blue-700 text-xs font-bold rounded-full">
            <Sparkles size={14} className="text-blue-600" />
            <span>AWS IAM STS Authentication</span>
          </div>
          
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            EKS Metric &amp; <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Cost Optimizer</span>
          </h1>

          <p className="text-xs sm:text-sm font-semibold text-slate-500 max-w-lg mx-auto tracking-wide uppercase">
            Real-Time Health &bull; Live Resource Metrics &bull; AI Rightsizing Savings
          </p>
        </div>

        {/* Connection Form Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xl shadow-slate-200/60 p-6 sm:p-8 space-y-6">
          
          {/* Connected Banner */}
          {isConnected && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800 font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>Connected: <code className="font-mono font-semibold text-[11px]">{roleArn}</code></span>
              </div>
              <button
                onClick={() => navigate(ROUTES.DASHBOARD)}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors cursor-pointer shrink-0 ml-2"
              >
                Open Dashboard →
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="roleArn" className="flex items-center gap-2 text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  <KeyRound size={15} className="text-blue-600" />
                  <span>AWS IAM Role ARN</span>
                </label>
                
                <button
                  type="button"
                  onClick={() => setArnInput(EXAMPLE_ROLE_ARN)}
                  className="text-xs text-blue-600 hover:text-blue-700 font-semibold transition-colors cursor-pointer"
                >
                  Fill Example ARN
                </button>
              </div>

              <div className="relative">
                <input
                  id="roleArn"
                  type="text"
                  value={arnInput}
                  onChange={(e) => setArnInput(e.target.value)}
                  placeholder="arn:aws:iam::123456789012:role/YourEKSViewerRole"
                  className="
                    w-full px-4 py-3.5 text-xs sm:text-sm font-mono bg-slate-50 border border-slate-300
                    rounded-xl text-slate-900 placeholder:text-slate-400
                    focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white focus:border-transparent
                    transition-all
                  "
                />
              </div>
            </div>

            {(localError || error) && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700 font-semibold">
                <AlertCircle size={16} className="shrink-0 text-red-600" />
                <span>{localError || error}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={submitting || loading}
                className="
                  flex-1 flex items-center justify-center gap-2 px-6 py-3.5
                  bg-blue-600 hover:bg-blue-700 disabled:opacity-50
                  text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-600/20
                  transition-all cursor-pointer active:scale-[0.99]
                "
              >
                {submitting || loading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <Zap size={16} />
                    <span>Connect AWS Account</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleUseDemo}
                disabled={submitting || loading}
                className="
                  flex items-center justify-center gap-2 px-5 py-3.5
                  border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700
                  font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer shrink-0
                "
              >
                <Sparkles size={15} className="text-blue-600" />
                <span>Try Demo Mode</span>
              </button>
            </div>
          </form>

        </div>

        {/* Feature Highlights: Pure Icons & Taglines (Zero Theory) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          
          <div className="bg-white border border-slate-200/80 rounded-xl p-4 flex flex-col items-center text-center space-y-2 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Server size={20} />
            </div>
            <span className="text-xs font-extrabold text-slate-900 block">Cluster Discovery</span>
            <span className="text-[11px] font-semibold text-slate-500">Multi-Region Scanning</span>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-xl p-4 flex flex-col items-center text-center space-y-2 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <Cpu size={20} />
            </div>
            <span className="text-xs font-extrabold text-slate-900 block">Resource Metrics</span>
            <span className="text-[11px] font-semibold text-slate-500">Live vCPU &amp; RAM Analytics</span>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-xl p-4 flex flex-col items-center text-center space-y-2 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <TrendingDown size={20} />
            </div>
            <span className="text-xs font-extrabold text-slate-900 block">AI Rightsizing</span>
            <span className="text-[11px] font-semibold text-slate-500">Automated Cost Reduction</span>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-xl p-4 flex flex-col items-center text-center space-y-2 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Activity size={20} />
            </div>
            <span className="text-xs font-extrabold text-slate-900 block">Activity Logs</span>
            <span className="text-[11px] font-semibold text-slate-500">Real-Time Audit Trail</span>
          </div>

        </div>

        {/* Security Badges: Simple Icons + 2-word Labels */}
        <div className="flex flex-wrap items-center justify-center gap-6 py-2 text-xs font-semibold text-slate-500">
          <div className="flex items-center gap-1.5">
            <Lock size={14} className="text-emerald-600" />
            <span>Read-Only STS IAM</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-blue-600" />
            <span>Zero Access Keys Stored</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-purple-600" />
            <span>Instant Revocation</span>
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="text-center text-xs text-slate-400 py-3 border-t border-slate-200">
        KubeWise EKS Metric &amp; AI Cost Optimization Platform
      </div>

    </div>
  )
}
