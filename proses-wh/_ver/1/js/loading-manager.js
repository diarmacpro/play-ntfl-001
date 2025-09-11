// Loading and Progress Management
export let isLoading = false;

export const loadingSteps = [
  { id: 'step1', text: 'Memuat data marketing...', weight: 25 },
  { id: 'step2', text: 'Memuat data helper...', weight: 25 },
  { id: 'step3', text: 'Memuat data barang...', weight: 25 },
  { id: 'step4', text: 'Memuat data surat jalan...', weight: 25 }
];

let currentProgress = 0;
let completedSteps = 0;

export function showLoading() {
  isLoading = true;
  currentProgress = 0;
  completedSteps = 0;
  
  document.getElementById('loadingOverlay').classList.remove('hidden');
  document.getElementById('progressBar').style.width = '0%';
  document.getElementById('progressText').textContent = 'Memulai...';
  document.getElementById('progressPercent').textContent = '0%';
  
  // Reset all steps
  loadingSteps.forEach(step => {
    const stepElement = document.getElementById(step.id);
    stepElement.querySelector('i').className = 'bi bi-circle text-gray-400 mr-2';
    stepElement.querySelector('span').className = 'text-gray-600';
  });
}

export function updateProgress(stepId, status = 'loading') {
  const step = loadingSteps.find(s => s.id === stepId);
  if (!step) return;

  const stepElement = document.getElementById(stepId);
  const icon = stepElement.querySelector('i');
  const text = stepElement.querySelector('span');

  if (status === 'loading') {
    icon.className = 'bi bi-arrow-clockwise text-blue-600 mr-2 animate-spin';
    text.className = 'text-blue-600 font-medium';
    document.getElementById('progressText').textContent = step.text;
  } else if (status === 'completed') {
    icon.className = 'bi bi-check-circle-fill text-green-600 mr-2';
    text.className = 'text-green-600 font-medium';
    completedSteps++;
    currentProgress = (completedSteps / loadingSteps.length) * 100;
    
    document.getElementById('progressBar').style.width = currentProgress + '%';
    document.getElementById('progressPercent').textContent = Math.round(currentProgress) + '%';
    
    if (completedSteps === loadingSteps.length) {
      setTimeout(() => {
        document.getElementById('progressText').textContent = 'Selesai!';
        hideLoading();
      }, 500);
    }
  } else if (status === 'error') {
    icon.className = 'bi bi-x-circle-fill text-red-600 mr-2';
    text.className = 'text-red-600 font-medium';
  }
}

export function hideLoading() {
  setTimeout(() => {
    document.getElementById('loadingOverlay').classList.add('hidden');
    isLoading = false;
    const params = new URLSearchParams(window.location.search);
    const initialId = params.get("idSj");
    if (initialId) {
      // Import and call activateCard from ui-manager
      import('./ui-manager.js').then(({ activateCard }) => {
        activateCard(initialId);
      });
    }
  }, 300);
}