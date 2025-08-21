"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Users, FileImage, Award } from "lucide-react"
import Image from "next/image"

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <style jsx>{`
        @keyframes hangingCard {
          0%, 100% { transform: rotate(-2deg); }
          50% { transform: rotate(2deg); }
        }
        .hanging-id-card {
          animation: hangingCard 3s ease-in-out infinite;
          transform-origin: top center;
        }
      `}</style>

      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">H</span>
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900">Harsha ID Solutions</div>
                <div className="text-xs text-gray-500 -mt-1">A Complete ID World...</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/auth/login">
                <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 bg-transparent">
                  Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <Card className="border-0 shadow-2xl mb-8 bg-gradient-to-br from-white to-blue-50 max-w-3xl mx-auto rounded-3xl">
            <CardContent className="p-4 rounded-3xl">
              <div className="flex justify-center mb-4">
                <div className="hanging-id-card">
                  <Image
                    src="/images/harsha-logo.jpeg"
                    alt="Harsha ID Solutions Logo"
                    width={500}
                    height={250}
                    className="h-40 w-auto object-contain drop-shadow-lg"
                  />
                </div>
              </div>
              <p className="text-lg text-gray-600 mt-4 font-medium">Professional ID Card Solutions</p>
            </CardContent>
          </Card>

          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Professional School ID Card Management System
          </h2>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Serving schools across Srikakulam, Vizianagaram, and Visakhapatnam since 2015. Streamline your student ID
            card creation and management with our comprehensive platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/login?role=admin">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
                Admin Login
              </Button>
            </Link>
            <Link href="/auth/login?role=teacher">
              <Button
                size="lg"
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 bg-transparent"
              >
                Teacher Login
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Secure Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Role-based access control ensuring data security and proper authorization for all users.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle className="text-lg">Multi-School Support</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Manage multiple schools from a single platform with dedicated teacher access controls.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FileImage className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle className="text-lg">Photo Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Easy photo upload and management system for student ID card generation.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Award className="w-6 h-6 text-orange-600" />
              </div>
              <CardTitle className="text-lg">Excel Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Bulk upload student data via Excel files for efficient data management.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* About Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-3xl font-bold text-gray-900 mb-6">Trusted by Schools Since 2015</h3>
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              Harsha ID Solutions has been providing comprehensive ID card services to educational institutions across
              Andhra Pradesh. Our digital platform streamlines the entire process from student data management to ID
              card generation, making it easier for schools to maintain professional standards.
            </p>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
                <div className="text-gray-600">Schools Served</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600 mb-2">50K+</div>
                <div className="text-gray-600">ID Cards Generated</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-2">9+</div>
                <div className="text-gray-600">Years of Experience</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Image
              src="/images/harsha-logo.jpeg"
              alt="Harsha ID Solutions Logo"
              width={80}
              height={40}
              className="h-8 w-auto object-contain brightness-0 invert"
            />
          </div>
          <p className="text-gray-400 mb-2">A COMPLETE ID WORLD</p>
          <p className="text-sm text-gray-500">
            Serving Srikakulam, Vizianagaram, and Visakhapatnam • Established 2015
          </p>
        </div>
      </footer>
    </div>
  )
}
