import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['https://pdf-merger-service-1.onrender.com', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
const tempDir = path.join(uploadsDir, 'temp');
fs.ensureDirSync(uploadsDir);
fs.ensureDirSync(tempDir);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF and images (JPEG, PNG, WEBP) are allowed.'), false);
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Convert image to PDF buffer
async function imageToPdf(imagePath) {
  const imageBuffer = await fs.readFile(imagePath);
  const metadata = await sharp(imageBuffer).metadata();
  
  // Create a PDF with the image dimensions (converted to points, 72 DPI)
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([metadata.width * 72 / metadata.density || 72, metadata.height * 72 / metadata.density || 72]);
  
  let image;
  if (path.extname(imagePath).toLowerCase() === '.png') {
    image = await pdfDoc.embedPng(imageBuffer);
  } else {
    image = await pdfDoc.embedJpg(imageBuffer);
  }
  
  const { width, height } = page.getSize();
  page.drawImage(image, {
    x: 0,
    y: 0,
    width,
    height,
  });
  
  return await pdfDoc.save();
}

// Merge PDFs endpoint
app.post('/api/merge', upload.array('files', 50), async (req, res) => {
  try {
    const { order } = req.body; // JSON string of file IDs in order
    const files = req.files;
    
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const orderArray = JSON.parse(order || '[]');
    
    // Sort files based on order
    const sortedFiles = orderArray.map(id => files.find(f => f.filename.startsWith(id))).filter(Boolean);
    
    // Add any remaining files not in order (shouldn't happen with proper frontend)
    const remainingFiles = files.filter(f => !orderArray.some(id => f.filename.startsWith(id)));
    const allFiles = [...sortedFiles, ...remainingFiles];

    // Create merged PDF
    const mergedPdf = await PDFDocument.create();

    for (const file of allFiles) {
      const filePath = file.path;
      const ext = path.extname(file.originalname).toLowerCase();

      try {
        if (ext === '.pdf') {
          // Load existing PDF
          const pdfBytes = await fs.readFile(filePath);
          const pdf = await PDFDocument.load(pdfBytes);
          const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
          copiedPages.forEach(page => mergedPdf.addPage(page));
        } else {
          // Convert image to PDF and merge
          const imagePdfBytes = await imageToPdf(filePath);
          const imagePdf = await PDFDocument.load(imagePdfBytes);
          const [page] = await mergedPdf.copyPages(imagePdf, [0]);
          mergedPdf.addPage(page);
        }
      } catch (err) {
        console.error(`Error processing file ${file.originalname}:`, err);
        throw new Error(`Failed to process ${file.originalname}`);
      }
    }

    // Save merged PDF
    const mergedPdfBytes = await mergedPdf.save();
    const outputFilename = `merged-${uuidv4()}.pdf`;
    const outputPath = path.join(uploadsDir, outputFilename);
    
    await fs.writeFile(outputPath, mergedPdfBytes);

    // Clean up temp files
    for (const file of allFiles) {
      await fs.remove(file.path).catch(console.error);
    }

    // Send file
    res.download(outputPath, 'merged-invoice.pdf', async (err) => {
      if (err) {
        console.error('Download error:', err);
      }
      // Clean up merged file after download
      setTimeout(() => {
        fs.remove(outputPath).catch(console.error);
      }, 60000); // Delete after 1 minute
    });

  } catch (error) {
    console.error('Merge error:', error);
    // Clean up temp files on error
    if (req.files) {
      for (const file of req.files) {
        await fs.remove(file.path).catch(console.error);
      }
    }
    res.status(500).json({ error: error.message || 'Failed to merge files' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: error.message });
});

app.listen(PORT, () => {
  console.log(`🚀 PDF Merger Server running on http://localhost:${PORT}`);
  console.log(`📁 Uploads directory: ${uploadsDir}`);
});