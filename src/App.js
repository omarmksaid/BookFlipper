import React, { useRef, useState, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// Move citypizzamenu.pdf to public folder for access
if (process.env.NODE_ENV === 'development') {
  // In development, the PDF should be in public folder
}

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [pageImages, setPageImages] = useState([]);
  const fileInputRef = useRef(null);
  
  useEffect(() => {
    const currentPath = window.location.pathname;
    if (currentPath !== '/') {
      const pdfName = currentPath.slice(1);
      console.log('Checking for PDF:', pdfName);
      
      // Check if script already exists
      if (!window.St) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/page-flip@2.0.7/dist/js/page-flip.browser.min.js';
        script.onload = () => {
          checkAndLoadPDF(pdfName);
        };
        document.head.appendChild(script);
      } else {
        checkAndLoadPDF(pdfName);
      }
    }
  }, []);

  const createFlipBookHTML = (pageImages) => {
    return `<!DOCTYPE html>
<html>
<head>
  <title>PDF Flip Book</title>
  <script src="https://cdn.jsdelivr.net/npm/page-flip@2.0.7/dist/js/page-flip.browser.min.js"></script>
  <style>
    body { margin: 0; background: rgb(80,80,80); display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; }
    #flipbook { box-shadow: 0 10px 30px rgba(0,0,0,0.5); max-width: 85vw; max-height: 85vh; transition: transform 0.3s ease; }
    @media (min-width: 1025px) { #flipbook { max-height: 75vh; } }
    .page { background: white; display: flex; align-items: center; justify-content: center; }
    .page img { width: 100%; height: 100%; object-fit: contain; }
    .controls { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); width: 90%; max-width: 800px; padding: 12px 20px; display: flex; align-items: center; justify-content: space-between; }
    .control-group { display: flex; align-items: center; gap: 15px; }
    .control-btn { background: none; border: none; color: white; cursor: pointer; padding: 8px; border-radius: 4px; transition: opacity 0.2s; }
    .control-btn:hover { opacity: 0.7; }
    .control-btn svg { width: 20px; height: 20px; fill: white; }
    .page-slider { flex: 1; margin: 0 20px; }
    .page-slider input[type="range"] { width: 100%; -webkit-appearance: none; background: white; height: 2px; border-radius: 1px; }
    .page-slider input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; background: white; border-radius: 50%; cursor: pointer; }
    .page-slider input[type="range"]::-moz-range-thumb { width: 16px; height: 16px; background: white; border-radius: 50%; cursor: pointer; border: none; }
    .page-info { color: white; font-size: 14px; min-width: 100px; text-align: center; }
    .grid-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); display: none; z-index: 1000; overflow-y: auto; padding: 20px; box-sizing: border-box; }
    .grid-container { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 15px; max-width: 1200px; margin: 0 auto; }
    .grid-page { cursor: pointer; border: 2px solid transparent; transition: border-color 0.2s; }
    .grid-page:hover { border-color: white; }
    .grid-page img { width: 100%; height: auto; display: block; }
    .close-grid { position: fixed; top: 20px; right: 20px; background: none; border: none; color: white; font-size: 24px; cursor: pointer; z-index: 1001; }
    @media (max-width: 1024px) { .controls { display: none; } }
  </style>
</head>
<body>
  <div id="flipbook"></div>
  <div class="controls">
    <div class="control-group">
      <button class="control-btn" id="homeBtn" title="Go to first page">
        <svg viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
      </button>
      <button class="control-btn" id="zoomBtn" title="Zoom and pan">
        <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
      </button>
      <button class="control-btn" id="gridBtn" title="View all pages">
        <svg viewBox="0 0 24 24"><path d="M3 3v8h8V3H3zm6 6H5V5h4v4zm-6 4v8h8v-8H3zm6 6H5v-4h4v4zm4-16v8h8V3h-8zm6 6h-4V5h4v4zm-6 4v8h8v-8h-8zm6 6h-4v-4h4v4z"/></svg>
      </button>
    </div>
    <div class="page-slider">
      <input type="range" id="pageSlider" min="0" max="${pageImages.length - 1}" value="0">
    </div>
    <div class="control-group">
      <span class="page-info" id="pageInfo">Page 1 of ${pageImages.length}</span>
    </div>
  </div>
  <script>
    const pages = ${JSON.stringify(pageImages)};
    const flipbookDiv = document.getElementById('flipbook');
    
    pages.forEach((page, index) => {
      const pageDiv = document.createElement('div');
      pageDiv.className = 'page';
      pageDiv.innerHTML = '<img src="' + page + '" alt="Page ' + (index + 1) + '">';
      flipbookDiv.appendChild(pageDiv);
    });
    
    const pageFlip = new St.PageFlip(flipbookDiv, {
      width: 400,
      height: 600,
      size: 'stretch',
      minWidth: 315,
      maxWidth: 1000,
      minHeight: 400,
      maxHeight: 1533,
      maxShadowOpacity: 0.5,
      showCover: false,
      startPage: 0,
      mobileScrollSupport: true
    });
    
    pageFlip.loadFromHTML(document.querySelectorAll('.page'));
    
    const pageSlider = document.getElementById('pageSlider');
    const pageInfo = document.getElementById('pageInfo');
    const homeBtn = document.getElementById('homeBtn');

    const zoomBtn = document.getElementById('zoomBtn');
    const gridBtn = document.getElementById('gridBtn');
    const gridOverlay = document.getElementById('gridOverlay');
    const gridContainer = document.getElementById('gridContainer');
    const closeGrid = document.getElementById('closeGrid');
    
    let isZoomMode = false;
    
    let isSliderUpdating = false;
    
    pageSlider.addEventListener('input', (e) => {
      isSliderUpdating = true;
      pageFlip.flip(parseInt(e.target.value));
      setTimeout(() => { isSliderUpdating = false; }, 100);
    });
    
    homeBtn.addEventListener('click', () => {
      pageFlip.flip(0);
    });
    

    
    zoomBtn.addEventListener('click', () => {
      isZoomMode = !isZoomMode;
      if (isZoomMode) {
        flipbookDiv.style.cursor = 'grab';
        flipbookDiv.style.transform = 'scale(1.5)';
        flipbookDiv.style.transformOrigin = 'center';
      } else {
        flipbookDiv.style.cursor = 'default';
        flipbookDiv.style.transform = 'scale(1)';
      }
    });
    
    gridBtn.addEventListener('click', () => {
      gridContainer.innerHTML = '';
      pages.forEach((page, index) => {
        const pageDiv = document.createElement('div');
        pageDiv.className = 'grid-page';
        pageDiv.innerHTML = \`<img src="\${page}" alt="Page \${index + 1}">\`;
        pageDiv.addEventListener('click', () => {
          pageFlip.flip(index);
          gridOverlay.style.display = 'none';
        });
        gridContainer.appendChild(pageDiv);
      });
      gridOverlay.style.display = 'block';
    });
    
    closeGrid.addEventListener('click', () => {
      gridOverlay.style.display = 'none';
    });
    
    function updatePageInfo() {
      const currentPage = pageFlip.getCurrentPageIndex() + 1;
      pageInfo.textContent = \`Page \${currentPage} of ${pageImages.length}\`;
      if (!isSliderUpdating) {
        pageSlider.value = pageFlip.getCurrentPageIndex();
      }
    }
    
    pageFlip.on('flip', updatePageInfo);
    pageFlip.on('changeState', updatePageInfo);
    pageFlip.on('changeOrientation', updatePageInfo);
    
    // Update immediately after load
    setTimeout(updatePageInfo, 100);
  </script>
  <div class="grid-overlay" id="gridOverlay">
    <button class="close-grid" id="closeGrid">&times;</button>
    <div class="grid-container" id="gridContainer"></div>
  </div>
</body>
</html>`;
  };

  const processPDF = async (arrayBuffer, openInNewTab = true) => {
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    const images = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      const viewport = page.getViewport({ scale: 2 });
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      
      await page.render({ canvasContext: context, viewport }).promise;
      images.push(canvas.toDataURL());
    }

    if (openInNewTab) {
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(createFlipBookHTML(images));
        newWindow.document.close();
      }
    } else {
      setPageImages(images);
    }
  };

  const checkAndLoadPDF = async (pdfName) => {
    setIsLoading(true);
    try {
      const pdfPath = `${pdfName}.pdf`;
      console.log('Attempting to load PDF:', pdfPath);
      const response = await fetch(pdfPath);
      if (!response.ok) {
        throw new Error(`PDF not found: ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      await processPDF(arrayBuffer, true);
    } catch (error) {
      console.error('PDF not found:', pdfName);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || file.type !== 'application/pdf') {
      alert('Please select a PDF file');
      return;
    }

    setIsLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      await processPDF(arrayBuffer);
    } catch (error) {
      alert('Error processing PDF');
    } finally {
      setIsLoading(false);
    }
  };

  const currentPath = window.location.pathname;
  const isPDFRoute = currentPath !== '/' && currentPath !== '';
  
  if (isPDFRoute) {
    return (
      <div className="app">
        <h1>PDF Flip Book</h1>
        {isLoading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Processing PDF...</p>
          </div>
        ) : (
          <div>
            <h2>PDF "{currentPath.slice(1)}.pdf" not found</h2>
            <button 
              className="upload-btn" 
              onClick={() => fileInputRef.current?.click()}
            >
              Upload PDF File
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="app">
      <h1>PDF Flip Book</h1>
      {isLoading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Processing PDF...</p>
        </div>
      ) : (
        <>
          <button 
            className="upload-btn" 
            onClick={() => fileInputRef.current?.click()}
          >
            Upload PDF File
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
          />
        </>
      )}
    </div>
  );
}

export default App;