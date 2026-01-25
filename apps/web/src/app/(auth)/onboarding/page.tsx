import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Building, User, Briefcase, Coins, Shield, CheckCircle } from 'lucide-react';

export default function OnboardingPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 flex items-center justify-center p-6">
            <div className="w-full max-w-2xl">
                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-white tracking-tight">
                        Op<span className="text-blue-400">Core</span>
                    </h1>
                    <p className="text-slate-400 mt-1">Smart Business Finance</p>
                </div>

                {/* Onboarding Card */}
                <div className="bg-white rounded-3xl shadow-2xl p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">Welcome! Let&apos;s get started</h2>
                        <p className="text-gray-500 mt-2">Tell us about your business so we can personalize your experience</p>
                    </div>

                    <form action="/api/auth/onboarding" method="POST" className="space-y-6">
                        {/* Account Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">Account Type</label>
                            <div className="grid grid-cols-2 gap-4">
                                <label className="cursor-pointer">
                                    <input type="radio" name="accountType" value="personal" className="sr-only peer" defaultChecked />
                                    <div className="p-4 rounded-xl border-2 border-gray-200 peer-checked:border-blue-500 peer-checked:bg-blue-50 transition flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                            <User size={24} />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">Personal</p>
                                            <p className="text-xs text-gray-500">Freelancer or sole trader</p>
                                        </div>
                                    </div>
                                </label>
                                <label className="cursor-pointer">
                                    <input type="radio" name="accountType" value="business" className="sr-only peer" />
                                    <div className="p-4 rounded-xl border-2 border-gray-200 peer-checked:border-blue-500 peer-checked:bg-blue-50 transition flex items-center gap-3">
                                        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                                            <Building size={24} />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">Business</p>
                                            <p className="text-xs text-gray-500">Registered company</p>
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Business Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Business / Display Name
                            </label>
                            <input
                                type="text"
                                name="businessName"
                                required
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Your business or personal name"
                            />
                        </div>

                        {/* Industry / Sector */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Industry / Sector
                            </label>
                            <select
                                name="sector"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Select your industry</option>
                                <option value="technology">Technology / IT Services</option>
                                <option value="retail">Retail / E-commerce</option>
                                <option value="professional_services">Professional Services</option>
                                <option value="manufacturing">Manufacturing</option>
                                <option value="agriculture">Agriculture</option>
                                <option value="real_estate">Real Estate</option>
                                <option value="healthcare">Healthcare</option>
                                <option value="education">Education</option>
                                <option value="hospitality">Hospitality / Food</option>
                                <option value="logistics">Logistics / Transport</option>
                                <option value="creative">Creative / Media</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        {/* Estimated Turnover */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Estimated Annual Turnover
                            </label>
                            <select
                                name="turnoverBand"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="micro">Under ₦5 million</option>
                                <option value="small_lower">₦5M - ₦15 million</option>
                                <option value="small_upper">₦15M - ₦25 million</option>
                                <option value="medium">₦25M - ₦100 million</option>
                                <option value="large">Over ₦100 million</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                This helps us determine your tax classification under NTA 2025
                            </p>
                        </div>

                        {/* TIN (Optional) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tax Identification Number (Optional)
                            </label>
                            <input
                                type="text"
                                name="tinNumber"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter your TIN if you have one"
                            />
                        </div>

                        {/* NTA 2025 Benefits */}
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                                <Shield className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                                <div>
                                    <p className="font-medium text-green-800">NTA 2025 Tax Benefits</p>
                                    <p className="text-sm text-green-600 mt-1">
                                        Based on your turnover, you may qualify for reduced tax rates or exemptions.
                                        We&apos;ll automatically calculate this for you.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            className="w-full py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2"
                        >
                            Complete Setup
                            <ArrowRight size={20} />
                        </button>

                        <p className="text-center text-sm text-gray-500">
                            You can update these details anytime in Settings
                        </p>
                    </form>
                </div>

                {/* Skip for now */}
                <div className="text-center mt-6">
                    <Link href="/dashboard" className="text-slate-400 hover:text-white text-sm transition">
                        Skip for now →
                    </Link>
                </div>
            </div>
        </div>
    );
}
