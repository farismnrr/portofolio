---
id: "05"
order: 5
slug: iotnet
year: "2026"
title: "IoTNet: Web Dashboard for IoT Device Management"
cardTitle: "IoTNet"
subtitle: "IoT Device Management Dashboard"
role: "Lead Engineer"
category: "IoT · Web"
description: "A Next.js web application for managing IoT devices, automation rules, monitoring, and user administration."
image: "/images/projects/iotnet/cover.png"
tech: [Next.js, React, TypeScript, PostgreSQL, Docker]
productUrl: "https://i-ot.net/"
repoUrl: "https://github.com/i-otnet/iotnet"
---

## Overview

**IoTNet** is a Next.js web application designed to manage Internet of Things (IoT) devices and automation rules. The application provides a comprehensive dashboard for monitoring devices, configuring automations, and administrating users.

## Solution

IoTNet provides a centralized IoT operations hub that unifies device control, automation workflows, and real-time monitoring in one dashboard, helping teams reduce operational overhead while improving reliability and response time.

## Who This Is For

- **End Users**: A web dashboard to view and control IoT devices with an intuitive interface
- **Developers and Integrators**: A codebase designed for extension, local testing, and deployment

## Key Features

- **Device Management**: Monitor and control IoT devices from a centralized dashboard
- **Automation Rules**: Configure and manage automation workflows for connected devices
- **User Administration**: Manage user access and permissions
- **Real-time Monitoring**: Live device status updates and data visualization
- **Responsive Design**: Optimized for desktop and mobile devices

## Tech Stack

### Frontend
- **Framework**: Next.js 16.1.1 with Turbopack
- **UI Library**: React 19.2.3
- **Styling**: Tailwind CSS 4
- **Components**: Shadcn UI (Radix UI primitives)
- **Icons**: Lucide React

### State Management and Data
- **State**: Zustand 5.0.9
- **Data Fetching**: TanStack React Query 5.90.16
- **Forms**: React Hook Form 7.69.0
- **Validation**: Zod 4.2.1

### Visualization
- **Charts**: Chart.js 4.5.1 with React Chart.js 2

### Backend Services
- **API**: .NET Core
- **Database**: PostgreSQL

### Developer Experience
- **Language**: TypeScript 5
- **Linting**: ESLint 9
- **Containerization**: Docker with auto-build scripts

## Architecture

The application follows a modern Next.js architecture with:
- Server-side rendering for optimal performance
- Client-side state management with Zustand
- API integration via React Query for efficient data fetching
- Component-based UI with Shadcn UI for consistency

### Backend Integration

IoTNet integrates with a custom [Multi-Tenant User Management Service](/projects/multitenant-user-management) for authentication, authorization, and multi-tenancy support.

## Deployment

Multiple deployment options available:
- **Production**: [https://i-ot.net/](https://i-ot.net/)
- **Development/Demo**: [https://app.iotunnel.my.id](https://app.iotunnel.my.id)
- **Local Development**: Standard Next.js dev server
- **Docker**: Automated build and deployment scripts

## Status

This project is under active development, representing a production-ready IoT management solution with continuous improvements and feature additions.
