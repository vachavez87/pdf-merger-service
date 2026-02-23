# 📄 PDF Invoice Merger

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green?logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-purple?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-cyan?logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A modern, full-stack web application for merging PDF documents and images into a single PDF file with an intuitive drag-and-drop interface. Perfect for invoicing, document management, and batch processing workflows.

![Demo Screenshot](./frontend/assets/markmap.svg)

## ✨ Features

- 🎯 **Drag & Drop Upload** - Upload multiple PDFs and images simultaneously
- 🔄 **Visual Reordering** - Drag-and-drop interface to arrange page order
- 🖼️ **Mixed Format Support** - Combine PDFs with images (PNG, JPG, WEBP) seamlessly
- ⚡ **Real-time Processing** - Instant preview with file type icons and sizes
- 🎨 **Modern UI** - Glassmorphism design with Tailwind CSS animations
- 🧹 **Auto-cleanup** - Temporary files automatically deleted after processing
- 📱 **Responsive Design** - Works on desktop and mobile devices
- 🔒 **Local Processing** - Files processed locally, never leave your machine

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ installed
- Windows, macOS, or Linux

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/pdf-invoice-merger.git
   cd pdf-invoice-merger
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```
   This installs dependencies for root, backend, and frontend in one command.

3. **Start development servers**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   
   Navigate to [http://localhost:5173](http://localhost:5173)

## 📖 Usage Guide

### 1. Upload Files
- Drag and drop files into the upload zone, or click to browse
- Supported formats: **PDF, PNG, JPG, JPEG, WEBP**
- Maximum file size: **50MB per file**

### 2. Arrange Order
- Drag the **⋮⋮** handle to reorder files
- Files are merged from **top to bottom**
- Remove files with the 🗑️ trash icon

### 3. Merge & Download
- Click **"Merge & Download PDF"**
- Your merged document downloads automatically
- Files are processed instantly with progress indicators

## 🏗️ Project Structure

```
pdf-merger-service/
├── 📁 backend/                 # Node.js + Express API
│   ├── 📄 server.js           # Main server with PDF processing logic
│   ├── 📄 package.json        # Backend dependencies
│   └── 📁 uploads/            # Temporary file storage
│       └── 📁 temp/           # Upload staging area
│
├── 📁 frontend/               # React + Vite Application
│   ├── 📄 index.html          # HTML entry point
│   ├── 📄 vite.config.js      # Vite configuration with proxy
│   ├── 📄 tailwind.config.js  # Tailwind CSS configuration
│   ├── 📄 postcss.config.js   # PostCSS configuration
│   ├── 📄 package.json        # Frontend dependencies
│   └── 📁 src/                # Source code
│       ├── 📄 App.jsx         # Main application component
│       ├── 📄 main.jsx        # React entry point
│       └── 📄 index.css       # Global styles & Tailwind
│
├── 📄 package.json            # Root package with workspace scripts
├── 📄 .gitignore             # Git ignore rules
└── 📄 README.md              # This file
```

## 🛠️ Tech Stack

### Backend
- **[Express.js](https://expressjs.com/)** - Fast, unopinionated web framework
- **[Multer](https://github.com/expressjs/multer)** - Middleware for handling multipart/form-data
- **[pdf-lib](https://pdf-lib.js.org/)** - Create and modify PDF documents
- **[Sharp](https://sharp.pixelplumbing.com/)** - High-performance image processing
- **[UUID](https://github.com/uuidjs/uuid)** - RFC4122 UUIDs for unique filenames
- **[fs-extra](https://github.com/jprichardson/node-fs-extra)** - Enhanced file system methods

### Frontend
- **[React 18](https://react.dev/)** - UI library with concurrent features
- **[Vite](https://vitejs.dev/)** - Next generation frontend tooling
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[@dnd-kit](https://dndkit.com/)** - Modern drag and drop toolkit
- **[react-dropzone](https://react-dropzone.js.org/)** - HTML5 drag-and-drop zone
- **[Lucide React](https://lucide.dev/)** - Beautiful icon library
- **[Axios](https://axios-http.com/)** - Promise-based HTTP client

## 📝 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run install:all` | Install dependencies for all workspaces |
| `npm run dev` | Start both backend and frontend concurrently |
| `npm run backend` | Start only the backend server |
| `npm run frontend` | Start only the frontend dev server |
| `npm run build` | Build frontend for production |
| `npm start` | Start production server (backend only) |

## 🔧 Configuration

### Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```env
PORT=3001                          # Server port (default: 3001)
MAX_FILE_SIZE=52428800            # Max file size in bytes (50MB)
UPLOAD_DIR=./uploads              # Upload directory path
```

### Frontend Proxy

The frontend is configured to proxy API requests to the backend during development. Edit `frontend/vite.config.js` to change the proxy target:

```javascript
proxy: {
  '/api': {
    target: 'http://localhost:3001',
    changeOrigin: true,
  },
}
```

## 🚀 Deployment

### Production Build

1. **Build the frontend**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

The backend will serve the built frontend static files automatically.

### Docker Deployment (Optional)

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm run install:all
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [pdf-lib](https://pdf-lib.js.org/) for excellent PDF manipulation capabilities
- [Sharp](https://sharp.pixelplumbing.com/) for blazing fast image processing
- [Tailwind CSS](https://tailwindcss.com/) for the beautiful utility-first styling
- [@dnd-kit](https://dndkit.com/) for the smooth drag-and-drop experience

## 📧 Support

If you found this project helpful, please give it a ⭐️!

For questions or support, please open an issue on GitHub.

---

<p align="center">
  Made with ❤️ for efficient document workflows
</p>
```
