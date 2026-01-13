# Faris Munir Mahdi - Portfolio

A modern, responsive portfolio website built with Next.js and Once UI, showcasing projects, blog posts, and professional experience with a clean, customizable design system.

🌐 **Live Preview**: [portofolio.iotunnel.my.id](https://portofolio.iotunnel.my.id)

## Overview

This is the personal portfolio website of **Faris Munir Mahdi**, a Software Engineer specializing in Backend, Cloud, and IoT. The portfolio emphasizes clean aesthetics, performance, and user experience while showcasing professional projects and technical writing.

## Key Features

- 📱 **Responsive Design**: Optimized for all devices with mobile-first approach
- 🌙 **Dark Mode**: Theme switching with system preference detection
- 📝 **MDX Blog**: Rich content with code syntax highlighting
- 🎨 **Project Showcase**: Dedicated pages for each project with detailed descriptions
- ⚡ **Performance**: Static site generation with Next.js for fast load times
- 🔍 **SEO Optimized**: Proper meta tags, Open Graph, and sitemap generation

## Tech Stack

### Frontend
- **Framework**: Next.js 16.1.1 with App Router
- **UI Library**: React 19.2.3
- **Design System**: Once UI (customizable component library)
- **Styling**: CSS Modules with design tokens
- **Icons**: Custom icon system with fallbacks

### Content Management
- **Blog**: MDX (Markdown + JSX) for rich content
- **Metadata**: Frontmatter-based project and blog metadata
- **Image Optimization**: Next.js Image component with lazy loading

### Developer Experience
- **Language**: TypeScript
- **Build Tool**: Turbopack (Next.js 16)
- **Linting**: ESLint with Next.js config
- **Version Control**: Git with conventional commits

## Development

To run the project locally:

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── work/         # Project showcase pages
│   │   ├── blog/         # Blog posts (MDX)
│   │   └── about/        # About page
│   ├── components/       # Reusable UI components
│   ├── resources/        # Content and configuration
│   └── utils/            # Utility functions
├── public/
│   └── images/           # Static images and assets
└── README.md
```

## Design Philosophy

- **Clean and Professional**: Minimalist design with focus on content
- **Customizable**: Design tokens for easy theming and modular architecture
- **Performance-First**: Static site generation, optimized images, minimal JavaScript

## License

This project is open source and available under the [MIT License](LICENSE).