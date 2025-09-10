# Streakly ✨

> Transform your goals into lasting habits with beautiful streak tracking and smart notifications.

Streakly is a modern habit tracking and task management application that helps users build consistent daily habits through gamification, streak tracking, and intelligent notifications. Built with React, TypeScript, and Supabase.

## 🌟 Features

### Core Functionality
- **📅 Today's Goals**: Daily task planning with priority levels and deadlines
- **🔥 Habit Streaks**: Visual streak tracking with milestone celebrations
- **📊 Streak Calendar**: Interactive calendar view of your consistency
- **📝 Task Manager**: Complete task lifecycle management
- **📚 Study Room**: Focused environment for learning goals
- **🔔 Smart Notifications**: Email alerts for overdue tasks and achievements

### Integrations
- **📋 Notion Sync**: Import tasks from Notion databases
- **📧 Email Notifications**: Automated reminders via Resend
- **📈 Analytics**: Track your progress and streaks over time

## 🏗️ Tech Stack

### Frontend
- **React 18.3.1** - Modern UI library with hooks
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible components
- **Lucide React** - Icon library
- **React Hook Form** - Form management
- **React Query** - Server state management

### Backend & Database
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Real-time subscriptions
  - Row Level Security (RLS)
  - Edge Functions
  - Authentication
- **Deno** - Runtime for edge functions

### External Services
- **Resend** - Email delivery service
- **Notion API** - Task synchronization


## 🔧 Key Features Explained

### 1. Streak Tracking System
- Calculates daily completion rates (80% threshold for streak continuation)
- Tracks consecutive days of goal completion
- Celebrates milestones at 7, 14, 30, 60, 90, 180, and 365 days
- Visual calendar representation of streaks

### 2. Smart Notification System
- **Overdue Task Alerts**: Daily check for missed deadlines
- **Streak Achievements**: Congratulations for hitting milestones
- **Email Delivery**: Professional emails via Resend API
- **Real-time Updates**: Live notifications in the app

### 3. Task Management
- Create, edit, and delete tasks
- Set priorities and deadlines
- Track completion status
- Filter and sort capabilities
- Integration with external systems

### 4. Study Room
- Focused environment for learning
- Session tracking with duration
- Subject categorization
- Progress analytics

## 🔌 API Endpoints

### Edge Functions

#### `/send-notifications`
Automated email notifications for:
- Overdue task reminders
- Streak achievement celebrations
- Manual notification triggers

#### `/notion-tasks`
Synchronizes tasks from Notion databases:
- Imports new tasks
- Updates existing tasks
- Maintains sync status

### Database Functions

#### `get_overdue_tasks()`
Returns tasks past their deadline that haven't been notified today.

#### `get_user_streaks()`
Calculates current streaks and identifies milestone achievements.

## 🎨 Design System

### Color Palette
- **Primary**: Violet gradient (`#8B5CF6` to `#A855F7`)
- **Secondary**: Light violet (`#F3F4F6`)
- **Accent**: Deep violet (`#7C3AED`)
- **Background**: Dynamic gradients with glassmorphism

### Components
- Built with shadcn/ui for consistency
- Custom animations and transitions
- Responsive design patterns
- Accessibility-first approach

## 🔐 Authentication & Security

### User Authentication
- Supabase Auth with email/password
- Secure session management
- Automatic token refresh
- Protected routes

### Data Security
- Row Level Security policies
- Encrypted data transmission
- API key management
- CORS configuration

## 📱 User Journey

1. **Sign Up/Login**: Secure authentication via Supabase
2. **Dashboard**: Overview of today's goals and current streaks
3. **Goal Setting**: Create tasks with priorities and deadlines
4. **Daily Tracking**: Mark tasks complete, build streaks
5. **Progress Review**: View calendar and analytics
6. **Notifications**: Receive reminders and celebrations
7. **Sync**: Optional integration with external tools
