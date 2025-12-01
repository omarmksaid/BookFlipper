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
    // Load StPageFlip script
    if (!window.St) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/page-flip@2.0.7/dist/js/page-flip.browser.min.js';
      document.head.appendChild(script);
    }
    
    const currentPath = window.location.pathname;
    if (currentPath !== '/') {
      const pdfName = currentPath.slice(1);
      console.log('Checking for PDF:', pdfName);
      checkAndLoadPDF(pdfName);
    }
  }, []);
  
  useEffect(() => {
    if (pageImages.length > 0 && window.St) {
      initializeFlipBook();
    }
  }, [pageImages]);
  
  const initializeFlipBook = () => {
    const flipbookDiv = document.getElementById('flipbook');
    if (!flipbookDiv) return;
    
    // Clear existing content
    flipbookDiv.innerHTML = '';
    
    // Add pages
    pageImages.forEach((page, index) => {
      const pageDiv = document.createElement('div');
      pageDiv.className = 'page';
      pageDiv.style.cssText = 'background: white; display: flex; align-items: center; justify-content: center;';
      pageDiv.innerHTML = `<img src="${page}" alt="Page ${index + 1}" style="width: 100%; height: 100%; object-fit: contain;">`;
      flipbookDiv.appendChild(pageDiv);
    });
    
    // Initialize StPageFlip
    const isMobile = window.innerWidth <= 768;
    const pageFlip = new window.St.PageFlip(flipbookDiv, {
      width: isMobile ? window.innerWidth * 0.9 : 400,
      height: window.innerHeight * 0.95,
      mobileScrollSupport: true,
      usePortrait: isMobile,
      maxShadowOpacity: 0,
      drawShadow: false
    });
    
    pageFlip.loadFromHTML(flipbookDiv.querySelectorAll('.page'));
  };

  const createFlipBookHTML = (pageImages) => {
    return `<!DOCTYPE html>
<html>
<head>
  <title>PDF Flip Book</title>
  <script src="https://cdn.jsdelivr.net/npm/page-flip@2.0.7/dist/js/page-flip.browser.min.js"></script>
  <style>
    body { margin: 0; background: rgb(80,80,80); display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; }
    #flipbook { box-shadow: 0 10px 30px rgba(0,0,0,0.5); width: 90vw; height: 80vh; transition: transform 0.3s ease; }
    @media (min-width: 1025px) { #flipbook { height: 75vh; } }
    .page { background: white; display: flex; align-items: center; justify-content: center; }
    .page img { width: 100%; height: 100%; object-fit: contain; }
    .stf__item { background: white !important; }
    .stf__outerShadow { opacity: 0.8 !important; }
    .stf__innerShadow { opacity: 0.6 !important; }
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
      width: Math.min(window.innerWidth * 0.8, 1200),
      height: Math.min(window.innerHeight * 0.7, 800),
      size: 'stretch',
      minWidth: 600,
      maxWidth: 1400,
      minHeight: 400,
      maxHeight: 1000,
      maxShadowOpacity: 0.8,
      showCover: false,
      startPage: 0,
      mobileScrollSupport: true,
      drawShadow: true,
      usePortrait: true
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
    
    console.log(`Processing PDF with ${pdf.numPages} pages`);

    for (let i = 1; i <= pdf.numPages; i++) {
      console.log(`Processing page ${i} of ${pdf.numPages}`);
      const page = await pdf.getPage(i);
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      const viewport = page.getViewport({ scale: 2 });
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      
      await page.render({ canvasContext: context, viewport }).promise;
      images.push(canvas.toDataURL());
      
      // Update state with current progress
      if (!openInNewTab) {
        setPageImages([...images]);
      }
    }

    console.log(`Finished processing ${images.length} pages`);
    
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
      const pdfPath = `${process.env.PUBLIC_URL || ''}/${pdfName}.pdf`;
      console.log('Attempting to load PDF:', pdfPath);
      const response = await fetch(pdfPath);
      if (!response.ok) {
        throw new Error(`PDF not found: ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      await processPDF(arrayBuffer, false);
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
      await processPDF(arrayBuffer, false);
    } catch (error) {
      alert('Error processing PDF');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePDFLink = async (url) => {
    if (!url) return;
    
    // Convert Google Drive share link to direct download link
    let pdfUrl = url;
    if (url.includes('drive.google.com')) {
      const fileId = url.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];
      if (fileId) {
        pdfUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
      }
    }

    setIsLoading(true);
    try {
      const response = await fetch(pdfUrl);
      if (!response.ok) throw new Error('Failed to fetch PDF');
      const arrayBuffer = await response.arrayBuffer();
      await processPDF(arrayBuffer, false);
    } catch (error) {
      alert('Error loading PDF from link');
    } finally {
      setIsLoading(false);
    }
  };

  const currentPath = window.location.pathname;
  const isPDFRoute = currentPath !== '/' && currentPath !== '';
  
  if (isPDFRoute) {
    return (
      <div style={{margin: 0, background: '#f8f8f8', minHeight: '100vh'}}>
        {isLoading ? (
          <div className="loading" style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}>
            <div className="spinner"></div>
            <p>Processing PDF...</p>
          </div>
        ) : pageImages.length > 0 ? (
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh'}}>
            <div id="flipbook"></div>
          </div>
        ) : (
          <div className="app">
            <h1>PDF Not Found</h1>
            <p>The PDF "{currentPath.slice(1)}.pdf" was not found.</p>
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
    <div style={{margin: 0, background: '#f8f8f8', minHeight: '100vh'}}>
      {isLoading ? (
        <div className="loading" style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'black', textAlign: 'center'}}>
          <div className="spinner" style={{border: '4px solid #f3f3f3', borderTop: '4px solid #3498db', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 2s linear infinite', margin: '0 auto 20px'}}></div>
          <p>Processing PDF... Found {pageImages.length} pages so far</p>
        </div>
      ) : pageImages.length > 0 ? (
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh'}}>
          <div id="flipbook"></div>
        </div>
      ) : (
        <div className="app" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Arial, sans-serif'}}>
          <h1 style={{color: 'black'}}>PDF Flip Book</h1>
          <input
            type="text"
            placeholder="Enter Google Drive PDF link"
            style={{padding: '12px', fontSize: '16px', width: '400px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '4px'}}
            onKeyPress={(e) => e.key === 'Enter' && handlePDFLink(e.target.value)}
          />
          <button 
            className="upload-btn" 
            onClick={() => fileInputRef.current?.click()}
            style={{padding: '12px 24px', fontSize: '16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '20px'}}
          >
            Upload PDF File
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            style={{display: 'none'}}
          />
        </div>
      )}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default App;