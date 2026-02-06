'use client';

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/protected-route';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Calendar, 
  Mail, 
  Star, 
  AlertCircle, 
  CheckCircle2,
  Clock,
  FileText,
  Sparkles
} from 'lucide-react';

// Mock data for the daily digest
const mockDigestData = {
  date: new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }),
  summary: {
    totalEmails: 24,
    importantEmails: 5,
    unreadEmails: 8,
    starredEmails: 3,
  },
  categories: [
    {
      name: 'Important',
      count: 5,
      icon: AlertCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-950/30',
      emails: [
        { id: '1', subject: 'Project deadline reminder', sender: 'manager@company.com', preview: 'The project deadline is approaching...' },
        { id: '2', subject: 'Meeting rescheduled', sender: 'admin@company.com', preview: 'Your 2pm meeting has been moved to 4pm...' },
      ]
    },
    {
      name: 'Starred',
      count: 3,
      icon: Star,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
      emails: [
        { id: '3', subject: 'Quarterly report draft', sender: 'finance@company.com', preview: 'Please review the attached quarterly report...' },
      ]
    },
    {
      name: 'Unread',
      count: 8,
      icon: Mail,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      emails: [
        { id: '4', subject: 'Newsletter: Tech Updates', sender: 'newsletter@tech.com', preview: 'This week in tech: AI advancements...' },
        { id: '5', subject: 'Invitation: Team Lunch', sender: 'hr@company.com', preview: 'You are invited to the monthly team lunch...' },
      ]
    },
    {
      name: 'Newsletters',
      count: 6,
      icon: FileText,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-950/30',
      emails: [
        { id: '6', subject: 'Weekly Digest', sender: 'digest@news.com', preview: 'Your personalized weekly digest is here...' },
      ]
    },
  ],
  aiInsights: [
    'You have 3 emails that require a response today',
    '2 meetings scheduled based on your calendar',
    'Consider archiving 10+ old promotional emails',
  ]
};

function DailyDigestContent() {
  const router = useRouter();

  const handleBackToMail = () => {
    router.push('/mail');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToMail}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Mail</span>
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                Daily Digest
              </h1>
            </div>
            <div className="w-24" /> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Date Header */}
        <div className="flex items-center space-x-2 mb-6">
          <Calendar className="h-5 w-5 text-gray-500" />
          <span className="text-lg text-gray-600 dark:text-gray-400">
            {mockDigestData.date}
          </span>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Emails</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {mockDigestData.summary.totalEmails}
                  </p>
                </div>
                <Mail className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Important</p>
                  <p className="text-2xl font-bold text-red-600">
                    {mockDigestData.summary.importantEmails}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Unread</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {mockDigestData.summary.unreadEmails}
                  </p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Starred</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {mockDigestData.summary.starredEmails}
                  </p>
                </div>
                <Star className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Email Categories */}
          <div className="md:col-span-2 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Email Categories
            </h2>
            
            {mockDigestData.categories.map((category) => {
              const Icon = category.icon;
              return (
                <Card key={category.name}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`p-2 rounded-lg ${category.bgColor}`}>
                          <Icon className={`h-5 w-5 ${category.color}`} />
                        </div>
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                      </div>
                      <Badge variant="secondary">{category.count}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {category.emails.map((email) => (
                        <div
                          key={email.id}
                          className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 dark:text-white truncate">
                                {email.subject}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {email.sender}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">
                                {email.preview}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                      {category.count > category.emails.length && (
                        <Button variant="ghost" size="sm" className="w-full text-gray-500">
                          + {category.count - category.emails.length} more
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* AI Insights Sidebar */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              AI Insights
            </h2>
            
            <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 border-purple-200 dark:border-purple-800">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  <CardTitle className="text-lg">Smart Summary</CardTitle>
                </div>
                <CardDescription>
                  AI-powered insights about your inbox
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {mockDigestData.aiInsights.map((insight, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <Clock className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {insight}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Mark all newsletters as read
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Star className="h-4 w-4 mr-2" />
                    Review starred emails
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Mail className="h-4 w-4 mr-2" />
                    Archive old emails
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function DailyDigestPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <ProtectedRoute>
        <DailyDigestContent />
      </ProtectedRoute>
    </Suspense>
  );
}
