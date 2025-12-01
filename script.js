// Set PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

let currentPage = 0;
let totalPages = 0;
let pages = [];

const pdfInput = document.getElementById('pdf-input');
const uploadSection = document.getElementById('upload-section');
const flipbookContainer = document.getElementById('flipbook-container');
const flipbook = document.getElementById('flipbook');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const pageInfo = document.getElementById('page-info');

pdfInput.addEventListener('change', handleFileUpload);

async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file || file.type !== 'application/pdf') {
        alert('Please select a valid PDF file');
        return;
    }

    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        await createFlipbook(pdf);
        
        uploadSection.style.display = 'none';
        flipbookContainer.style.display = 'block';
    } catch (error) {
        console.error('Error processing PDF:', error);
        alert('Error processing PDF file');
    }
}

async function createFlipbook(pdf) {
    totalPages = pdf.numPages;
    pages = [];
    flipbook.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const page = await pdf.getPage(i);
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        const viewport = page.getViewport({ scale: 1.5 });
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        await page.render({ canvasContext: context, viewport }).promise;
        
        const pageElement = document.createElement('div');
        pageElement.className = 'page';
        pageElement.style.left = i % 2 === 1 ? '0' : '300px';
        
        const img = document.createElement('img');
        img.src = canvas.toDataURL();
        pageElement.appendChild(img);
        
        flipbook.appendChild(pageElement);
        pages.push(pageElement);
    }

    currentPage = 0;
    updateDisplay();
    setupControls();
}

function setupControls() {
    prevBtn.addEventListener('click', () => {
        if (currentPage > 0) {
            currentPage -= 2;
            updateDisplay();
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages - 2) {
            currentPage += 2;
            updateDisplay();
        }
    });
}

function updateDisplay() {
    pages.forEach((page, index) => {
        page.style.display = 'none';
        page.classList.remove('flipped');
    });

    // Show current spread (2 pages)
    if (pages[currentPage]) {
        pages[currentPage].style.display = 'block';
        pages[currentPage].className = 'page left';
    }
    
    if (pages[currentPage + 1]) {
        pages[currentPage + 1].style.display = 'block';
        pages[currentPage + 1].className = 'page right';
    }

    // Update controls
    prevBtn.disabled = currentPage <= 0;
    nextBtn.disabled = currentPage >= totalPages - 2;
    
    const displayPage = Math.floor(currentPage / 2) + 1;
    const displayTotal = Math.ceil(totalPages / 2);
    pageInfo.textContent = `Page ${displayPage} of ${displayTotal}`;
}

// Add flip animation on click
flipbook.addEventListener('click', (e) => {
    const rect = flipbook.getBoundingClientRect();
    const x = e.clientX - rect.left;
    
    if (x > 300 && currentPage < totalPages - 2) {
        // Clicked right side - next page
        const rightPage = pages[currentPage + 1];
        if (rightPage) {
            rightPage.classList.add('flipped');
            setTimeout(() => {
                currentPage += 2;
                updateDisplay();
            }, 300);
        }
    } else if (x <= 300 && currentPage > 0) {
        // Clicked left side - previous page
        currentPage -= 2;
        const leftPage = pages[currentPage + 1];
        if (leftPage) {
            leftPage.classList.add('flipped');
            setTimeout(() => {
                updateDisplay();
            }, 300);
        }
    }
});