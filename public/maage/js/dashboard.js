let currentDisease = 'mpox-2024';
let diseaseData = {};
let chartsInstances = {};
let darkMode = localStorage.getItem('darkMode') === 'enabled';

async function initializeApp() {
  try {
    console.log("Starting application initialization...");

    // Initialize UI components that don't depend on data
    initDarkMode();
    initNavbar();
    initMobileMenu();
    initMenuNavigation();
    initSearch();

    // Fetch disease data first and wait for it to complete
    console.log("Fetching disease data...");
    await fetchDiseaseData();
    console.log("Disease data loaded successfully");

    // Initialize components that depend on disease data
    initDiseaseSelectors();
    initMapPlaceholders();
    initInteractiveElements();

    console.log("Application initialization complete");
  } catch (error) {
    console.error("Error during application initialization:", error);
    alert("There was a problem initializing the application. Please check the console for details.");
  }
}

// Fetch all disease data when the page loads
document.addEventListener('DOMContentLoaded', function() {
  initializeApp().catch(error => {
    console.error("Failed to initialize application:", error);
  });
});

// Initialize dark mode functionality
function initDarkMode() {
  // Check if user has previously selected dark mode
  if (darkMode) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  const darkModeToggle = document.getElementById('dark-mode-toggle');
  if (darkModeToggle) {
    darkModeToggle.addEventListener('click', function() {
      // Toggle dark mode
      darkMode = !darkMode;

      // Update localStorage
      localStorage.setItem('darkMode', darkMode ? 'enabled' : 'disabled');

      // Apply or remove the dark theme class
      if (darkMode) {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }

      // Update charts with new theme colors if they exist
      updateChartsTheme();
    });
  }
}

// Update charts theme when switching modes
function updateChartsTheme() {
  // Update all chart instances with new theme colors
  for (const chartId in chartsInstances) {
    if (chartsInstances[chartId]) {
      chartsInstances[chartId].update();
    }
  }
}

// Initialize mobile menu functionality
function initMobileMenu() {
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const navItems = document.getElementById('nav-items');

  if (mobileMenuToggle && navItems) {
    mobileMenuToggle.addEventListener('click', function() {
      navItems.classList.toggle('show');

      // Change icon based on menu state
      const icon = this.querySelector('i');
      if (navItems.classList.contains('show')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
      } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
      }
    });

    // Close menu when a link is clicked
    const navLinks = navItems.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', function() {
        // Only close if we're in mobile view (menu toggle is visible)
        if (window.getComputedStyle(mobileMenuToggle).display !== 'none') {
          navItems.classList.remove('show');
          const icon = mobileMenuToggle.querySelector('i');
          icon.classList.remove('fa-times');
          icon.classList.add('fa-bars');
        }
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
      if (!navItems.contains(event.target) && !mobileMenuToggle.contains(event.target) && navItems.classList.contains('show')) {
        navItems.classList.remove('show');
        const icon = mobileMenuToggle.querySelector('i');
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
      }
    });
  }
}

// Search flyout utility functions
function toggleSearchFlyout() {
  const searchFlyout = document.getElementById('search-flyout');
  if (searchFlyout.classList.contains('active')) {
    hideSearchFlyout();
  } else {
    showSearchFlyout();
  }
}

function showSearchFlyout() {
  const searchFlyout = document.getElementById('search-flyout');
  searchFlyout.classList.add('active');
  setTimeout(() => {
    // Focus on input after animation completes
    const searchInput = searchFlyout.querySelector('input');
    if (searchInput) searchInput.focus();
  }, 300);
}

function hideSearchFlyout() {
  const searchFlyout = document.getElementById('search-flyout');
  searchFlyout.classList.remove('active');
}

function performSearch(query) {
  if (query.trim()) {
    console.log('Searching for:', query);
    // In a real implementation, this would perform a search and display results
    // For now, just hide the search flyout and show a temporary message
    hideSearchFlyout();

    // Show a temporary search message
    const messageDiv = document.createElement('div');
    messageDiv.className = 'search-message';
    messageDiv.innerHTML = `<p>Searching for: <strong>${query}</strong></p>`;
    document.body.appendChild(messageDiv);

    setTimeout(() => {
      messageDiv.classList.add('show');
      setTimeout(() => {
        messageDiv.classList.remove('show');
        setTimeout(() => {
          document.body.removeChild(messageDiv);
        }, 300);
      }, 2000);
    }, 100);
  }
}

// Initialize navbar functionality
function initNavbar() {
    // Dropdown menu functionality
    const navItems = document.querySelectorAll('.nav-item');

    // Add click event to each nav item
    navItems.forEach(item => {
      const link = item.querySelector('a');
      const dropdown = item.querySelector('.dropdown-content');

      if (link && dropdown) {
        link.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();

          // Close all other open dropdowns
          navItems.forEach(otherItem => {
            if (otherItem !== item) {
              otherItem.classList.remove('active');
              const otherDropdown = otherItem.querySelector('.dropdown-content');
              if (otherDropdown) {
                otherDropdown.classList.remove('show');
              }
            }
          });

          // Toggle current dropdown
          item.classList.toggle('active');
          dropdown.classList.toggle('show');
        });
      }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
      navItems.forEach(item => {
        const dropdown = item.querySelector('.dropdown-content');
        if (dropdown && !item.contains(e.target)) {
          item.classList.remove('active');
          dropdown.classList.remove('show');
        }
      });
    });

    // Search functionality
    const searchIcon = document.querySelector('.search-icon');
    const searchFlyout = document.getElementById('search-flyout');

    if (searchIcon && searchFlyout) {
      // Search icon click event
      searchIcon.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation(); // Prevent event from bubbling up
        toggleSearchFlyout();

        // Close any open dropdowns when search is opened
        navItems.forEach(item => {
          item.classList.remove('active');
          const dropdown = item.querySelector('.dropdown-content');
          if (dropdown) {
            dropdown.classList.remove('show');
          }
        });
      });

      // Close button click event
      const closeBtn = searchFlyout.querySelector('.search-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', function() {
          hideSearchFlyout();
        });
      }

      // Close search flyout when clicked outside
      document.addEventListener('click', function(event) {
        if (searchFlyout.classList.contains('active') &&
            !searchFlyout.contains(event.target) &&
            !searchIcon.contains(event.target)) {
          hideSearchFlyout();
        }
      });

      // Close search flyout when ESC key is pressed
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && searchFlyout.classList.contains('active')) {
          hideSearchFlyout();
        }
      });

      // Handle search submission
      const searchInput = searchFlyout.querySelector('input');
      if (searchInput) {
        searchInput.addEventListener('keyup', function(e) {
          if (e.key === 'Enter') {
            performSearch(this.value);
          }
        });

        // Prevent clicks inside search flyout from closing it
        searchFlyout.addEventListener('click', function(e) {
          e.stopPropagation();
        });
      }
    }
  }

// Initialize navigation menu
function initMenuNavigation() {
    const menuItems = document.querySelectorAll('.menu-item');
    const sections = document.querySelectorAll('.section');

    menuItems.forEach(item => {
      item.addEventListener('click', function() {
        const targetSection = this.getAttribute('data-section');

        // Update menu active state
        menuItems.forEach(mi => mi.classList.remove('active'));
        this.classList.add('active');

        // Show target section, hide others
        sections.forEach(section => {
          section.classList.remove('active');
          if (section.id === targetSection) {
            section.classList.add('active');
          }
        });

        // Update data based on active section
        if (targetSection === 'diseases') {
          // Get the active disease button or default to the first one
          const activeBtn = document.querySelector('.disease-btn.active') || document.querySelector('.disease-btn');
          if (activeBtn) {
            const diseaseId = activeBtn.getAttribute('data-disease');
            updateDiseaseDetails(diseaseId);
          }
        } else if (targetSection === 'genomics') {
          // Get the active genomics button or default to the first one
          const activeBtn = document.querySelector('.genomics-btn.active') || document.querySelector('.genomics-btn');
          if (activeBtn) {
            const diseaseId = activeBtn.getAttribute('data-disease');
            updateGenomicsData(diseaseId);
          }
        } else if (targetSection === 'predictions') {
          // Reset prediction data with a slight delay to ensure DOM is ready
          setTimeout(() => {
            // Force active disease to be current
            const activeBtn = document.querySelector('.prediction-btn.active') || document.querySelector('.prediction-btn');
            if (activeBtn) {
              currentDisease = activeBtn.getAttribute('data-disease');
            }
            initPredictionsData();
          }, 200);
        }
      });
    });
  }

// Fetch disease data from static JSON file instead of API
async function fetchDiseaseData() {
  try {
    console.log("Fetching disease data from static file...");

    // Static disease data directly embedded in the app instead of fetching from API
    const staticDiseaseData = {
      "mpox-2024": {
        name: "Monkeypox virus",
        totalCases: 8743,
        fatalitiesCount: 276,
        countries: {
          "USA": 1254,
          "UK": 567,
          "Brazil": 2187,
          "DR Congo": 3421,
          "Nigeria": 982,
          "Others": 332
        },
        timeline: [
          { date: "2024-01-01", newCases: 120 },
          { date: "2024-01-15", newCases: 240 },
          { date: "2024-02-01", newCases: 380 },
          { date: "2024-02-15", newCases: 560 },
          { date: "2024-03-01", newCases: 798 },
          { date: "2024-03-15", newCases: 1201 },
          { date: "2024-04-01", newCases: 1532 },
          { date: "2024-04-15", newCases: 1890 },
          { date: "2024-05-01", newCases: 2022 }
        ],
        genomicData: {
          variants: [
            { name: "Clade I", percentage: 12.5, r0: 1.8 },
            { name: "Clade II", percentage: 82.3, r0: 2.2 },
            { name: "Clade III", percentage: 5.2, r0: 1.6 }
          ]
        }
      },
      "h5n1-2024": {
        name: "Influenza A/H5N1",
        totalCases: 4219,
        fatalitiesCount: 381,
        countries: {
          "USA": 912,
          "China": 876,
          "Vietnam": 654,
          "India": 548,
          "Indonesia": 389,
          "Others": 840
        },
        timeline: [
          { date: "2024-01-01", newCases: 89 },
          { date: "2024-01-15", newCases: 167 },
          { date: "2024-02-01", newCases: 295 },
          { date: "2024-02-15", newCases: 418 },
          { date: "2024-03-01", newCases: 567 },
          { date: "2024-03-15", newCases: 743 },
          { date: "2024-04-01", newCases: 921 },
          { date: "2024-04-15", newCases: 1019 },
          { date: "2024-05-01", newCases: 1287 }
        ],
        genomicData: {
          variants: [
            { name: "Clade 2.3.4.4b", percentage: 67.8, r0: 1.9 },
            { name: "Clade 2.3.4.4c", percentage: 23.1, r0: 2.1 },
            { name: "Clade 2.3.2.1", percentage: 9.1, r0: 1.7 }
          ]
        }
      },
      "sarscov2": {
        name: "SARS-CoV-2",
        totalCases: 712438901,
        fatalitiesCount: 6958516,
        countries: {
          "USA": 103436829,
          "India": 44986461,
          "France": 39894902,
          "Germany": 38435774,
          "Brazil": 37039535,
          "Others": 448645400
        },
        timeline: [
          { date: "2024-01-01", newCases: 187432 },
          { date: "2024-01-15", newCases: 201374 },
          { date: "2024-02-01", newCases: 198765 },
          { date: "2024-02-15", newCases: 176543 },
          { date: "2024-03-01", newCases: 154329 },
          { date: "2024-03-15", newCases: 143287 },
          { date: "2024-04-01", newCases: 121987 },
          { date: "2024-04-15", newCases: 98765 },
          { date: "2024-05-01", newCases: 87654 }
        ],
        genomicData: {
          variants: [
            { name: "JN.1", percentage: 61.3, r0: 2.5 },
            { name: "XBB.1.5", percentage: 17.8, r0: 2.2 },
            { name: "FLiRT", percentage: 12.4, r0: 2.3 },
            { name: "Others", percentage: 8.5, r0: 2.0 }
          ]
        }
      },
      "ebolavirus": {
        name: "Ebolavirus",
        totalCases: 3476,
        fatalitiesCount: 1872,
        countries: {
          "DR Congo": 1532,
          "Uganda": 876,
          "Sierra Leone": 432,
          "Guinea": 298,
          "Liberia": 187,
          "Others": 151
        },
        timeline: [
          { date: "2024-01-01", newCases: 32 },
          { date: "2024-01-15", newCases: 78 },
          { date: "2024-02-01", newCases: 145 },
          { date: "2024-02-15", newCases: 234 },
          { date: "2024-03-01", newCases: 375 },
          { date: "2024-03-15", newCases: 512 },
          { date: "2024-04-01", newCases: 687 },
          { date: "2024-04-15", newCases: 743 },
          { date: "2024-05-01", newCases: 670 }
        ],
        genomicData: {
          variants: [
            { name: "Zaire ebolavirus", percentage: 78.4, r0: 1.8 },
            { name: "Sudan ebolavirus", percentage: 16.7, r0: 1.5 },
            { name: "Bundibugyo ebolavirus", percentage: 4.9, r0: 1.4 }
          ]
        }
      },
      "dengue": {
        name: "Dengue virus",
        totalCases: 128750,
        fatalitiesCount: 1432,
        countries: {
          "Brazil": 32450,
          "Philippines": 24680,
          "India": 18975,
          "Indonesia": 17824,
          "Mexico": 15320,
          "Others": 19501
        },
        timeline: [
          { date: "2024-01-01", newCases: 5432 },
          { date: "2024-01-15", newCases: 7864 },
          { date: "2024-02-01", newCases: 10237 },
          { date: "2024-02-15", newCases: 14356 },
          { date: "2024-03-01", newCases: 17652 },
          { date: "2024-03-15", newCases: 21984 },
          { date: "2024-04-01", newCases: 24867 },
          { date: "2024-04-15", newCases: 25987 },
          { date: "2024-05-01", newCases: 26791 }
        ],
        genomicData: {
          variants: [
            { name: "DENV-1", percentage: 34.2, r0: 1.3 },
            { name: "DENV-2", percentage: 28.7, r0: 1.4 },
            { name: "DENV-3", percentage: 24.1, r0: 1.2 },
            { name: "DENV-4", percentage: 13.0, r0: 1.1 }
          ]
        }
      },
      "zika": {
        name: "Zika virus",
        totalCases: 6874,
        fatalitiesCount: 58,
        countries: {
          "Brazil": 2354,
          "Colombia": 1236,
          "Mexico": 854,
          "Puerto Rico": 642,
          "Honduras": 487,
          "Others": 1301
        },
        timeline: [
          { date: "2024-01-01", newCases: 156 },
          { date: "2024-01-15", newCases: 287 },
          { date: "2024-02-01", newCases: 435 },
          { date: "2024-02-15", newCases: 576 },
          { date: "2024-03-01", newCases: 743 },
          { date: "2024-03-15", newCases: 964 },
          { date: "2024-04-01", newCases: 1243 },
          { date: "2024-04-15", newCases: 1375 },
          { date: "2024-05-01", newCases: 1095 }
        ],
        genomicData: {
          variants: [
            { name: "Asian lineage", percentage: 68.3, r0: 1.4 },
            { name: "African lineage", percentage: 27.5, r0: 1.2 },
            { name: "Other lineages", percentage: 4.2, r0: 1.0 }
          ]
        }
      }
    };

    // Create a list of diseases from the static data
    const diseasesList = Object.entries(staticDiseaseData).map(([key, value]) => ({
      id: key,
      name: value.name,
      totalCases: value.totalCases,
      fatalitiesCount: value.fatalitiesCount
    }));

    console.log("Diseases list:", diseasesList);

    // Once all data is successfully loaded, update the global diseaseData
    diseaseData = staticDiseaseData;
    console.log("Loaded disease data:", Object.keys(diseaseData));

    // Initialize the dashboard with data
    initDashboardData();

    // Create initial charts
    createOverviewCharts();
    updateDiseaseDetails(currentDisease);
    updateGenomicsData(currentDisease);
    initPredictionsData();

    return diseaseData;
  } catch (error) {
    console.error('Error loading disease data:', error);
    alert(`Error loading disease data: ${error.message}. Please check the console for details and reload the page.`);
    throw error;
  }
}

// Initialize disease selector buttons
function initDiseaseSelectors() {
  // Disease detail page selectors
  const diseaseButtons = document.querySelectorAll('.disease-btn');
  diseaseButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      const diseaseId = this.getAttribute('data-disease');

      // Update active button
      diseaseButtons.forEach(b => b.classList.remove('active'));
      this.classList.add('active');

      // Update disease details
      updateDiseaseDetails(diseaseId);
    });
  });

  // Genomics page selectors
  const genomicsButtons = document.querySelectorAll('.genomics-btn');
  genomicsButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      const diseaseId = this.getAttribute('data-disease');

      // Update active button
      genomicsButtons.forEach(b => b.classList.remove('active'));
      this.classList.add('active');

      // Update genomics data
      updateGenomicsData(diseaseId);
    });
  });

  // Outbreak card buttons
  const outbreakCards = document.querySelectorAll('.outbreak-card');
  outbreakCards.forEach(card => {
    const viewDetailsBtn = card.querySelector('.btn-details');
    viewDetailsBtn.addEventListener('click', function() {
      const diseaseId = card.getAttribute('data-disease');

      // Navigate to disease detail page
      const menuItems = document.querySelectorAll('.menu-item');
      menuItems.forEach(mi => {
        mi.classList.remove('active');
        if (mi.getAttribute('data-section') === 'diseases') {
          mi.classList.add('active');
        }
      });

      // Show diseases section
      const sections = document.querySelectorAll('.section');
      sections.forEach(section => {
        section.classList.remove('active');
        if (section.id === 'diseases') {
          section.classList.add('active');
        }
      });

      // Update active disease button
      const diseaseButtons = document.querySelectorAll('.disease-btn');
      diseaseButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-disease') === diseaseId) {
          btn.classList.add('active');
        }
      });

      // Update disease details
      updateDiseaseDetails(diseaseId);
    });
  });
}

// Initialize search functionality
function initSearch() {
  const searchInput = document.getElementById('search-input');

  if (searchInput) {
    searchInput.addEventListener('keyup', async function(e) {
      if (e.key === 'Enter') {
        const query = this.value.trim();
        if (query) {
          try {
            // For static site, just show a message instead of actually fetching
            console.log('Search query:', query);

            // Show a temporary message about searching in the static version
            const searchResults = Object.keys(diseaseData)
              .filter(key => diseaseData[key].name.toLowerCase().includes(query.toLowerCase()))
              .map(key => ({
                id: key,
                name: diseaseData[key].name,
                totalCases: diseaseData[key].totalCases,
                fatalitiesCount: diseaseData[key].fatalitiesCount
              }));

            console.log('Static search results:', searchResults);

          } catch (error) {
            console.error('Error searching:', error);
          }
        }
      }
    });
  }

  // Dataset search
  const datasetSearchBtn = document.getElementById('search-datasets-btn');
  if (datasetSearchBtn) {
    datasetSearchBtn.addEventListener('click', function() {
      const datasetSearchEl = document.getElementById('dataset-search');
      const datasetQuery = datasetSearchEl ? datasetSearchEl.value.trim() : '';
      if (datasetQuery) {
        // For demo purposes, just log the query
        console.log('Searching for datasets:', datasetQuery);
        // In a static site, just acknowledge the search was attempted
        alert(`Search for "${datasetQuery}" would fetch matching datasets from the server in the dynamic version.`);
      }
    });
  }
}

// Initialize disclaimer toggle functionality
function initDisclaimerToggle() {
  const disclaimerToggle = document.getElementById('disclaimer-toggle');
  const disclaimerContainer = document.getElementById('disclaimer-container');

  if (disclaimerToggle && disclaimerContainer) {
    // Make sure it's hidden by default
    disclaimerContainer.classList.add('hidden');

    // Add click event listener
    disclaimerToggle.addEventListener('click', function(e) {
      e.preventDefault();
      disclaimerContainer.classList.toggle('hidden');

      // Subtle animation effect
      if (!disclaimerContainer.classList.contains('hidden')) {
        disclaimerContainer.style.opacity = '0';
        setTimeout(() => {
          disclaimerContainer.style.opacity = '1';
        }, 10);
      }
    });

    console.log('Disclaimer toggle initialized');
  } else {
    console.warn('Disclaimer elements not found');
  }
}

// Initialize buttons and interactive elements
function initInteractiveElements() {
  // Prediction timeframe buttons
  const timeframeButtons = document.querySelectorAll('.timeframe-btn');
  timeframeButtons.forEach(btn => {
    btn.addEventListener('click', function(event) {
      // Use the event target instead of 'this' for more reliable behavior
      const clickedButton = event.currentTarget;

      timeframeButtons.forEach(b => b.classList.remove('active'));
      clickedButton.classList.add('active');

      const days = clickedButton.getAttribute('data-days');
      updatePredictionTimeframe(days);
    });
  });

  // Prediction disease buttons
  const predictionButtons = document.querySelectorAll('.prediction-btn');
  predictionButtons.forEach(btn => {
    btn.addEventListener('click', function(event) {
      // Use the event target instead of 'this' for more reliable behavior
      const clickedButton = event.currentTarget;
      const diseaseId = clickedButton.getAttribute('data-disease');

      // Update active button
      predictionButtons.forEach(b => b.classList.remove('active'));
      clickedButton.classList.add('active');

      // Update prediction disease
      updatePredictionDisease(diseaseId);
    });
  });

  // Dataset import buttons
  const importButtons = document.querySelectorAll('.btn-import');
  importButtons.forEach(btn => {
    btn.addEventListener('click', function(event) {
      // Use the event target instead of 'this' for more reliable behavior
      const clickedButton = event.currentTarget;
      const datasetCard = clickedButton.closest('.dataset-card');
      const datasetName = datasetCard.querySelector('h4').textContent;

      // For demo purposes, just show an alert
      alert(`Importing dataset: ${datasetName}`);
      // In a real implementation, this would trigger the import process
    });
  });

  // Initialize the disclaimer toggle
  initDisclaimerToggle();
}

// Initialize dashboard data
function initDashboardData() {
  // This function would populate the dashboard with initial data
  // For demonstration purposes, we'll keep the hardcoded values
}

// Initialize overview page
function createOverviewCharts() {
  // Charts have been removed from overview cards
  console.log("Overview section initialized");
}

// Create a small line chart for the outbreak cards
function createOutbreakChart(chartId, timelineData) {
  const ctx = document.getElementById(chartId).getContext('2d');

  // Map chart IDs to disease IDs
  const chartToDiseaseMap = {
    'mpox-chart': 'mpox-2024',
    'h5n1-chart': 'h5n1-2024',
    'covid-chart': 'sarscov2',
    'ebola-chart': 'ebolavirus',
    'dengue-chart': 'dengue',
    'zika-chart': 'zika'
  };

  // Get disease-specific colors from the global distribution color mapping
  const diseaseColors = {
    'mpox-2024': '#8db4a3',
    'h5n1-2024': '#6498ac',
    'sarscov2': '#aeaac9',
    'ebolavirus': '#ecc188',
    'dengue': '#c57c80',
    'zika': '#c3b59c'
  };

  // Get the appropriate color for this chart
  const diseaseId = chartToDiseaseMap[chartId];
  const chartColor = diseaseColors[diseaseId] || '#3498db'; // Fallback if no mapping

  // Extract data for the chart
  const labels = timelineData.map(item => {
    const date = new Date(item.date);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  });

  const data = timelineData.map(item => item.newCases);

  // Create the chart
  chartsInstances[chartId] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'New Cases',
        data: data,
        borderColor: chartColor,
        backgroundColor: `${chartColor}33`, // 33 is 20% opacity in hex
        borderWidth: 2,
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
          labels: {
            color: getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim()
          }
        },
        tooltip: {
          enabled: true,
          mode: 'index',
          intersect: false,
          backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--card-color').trim(),
          titleColor: getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim(),
          bodyColor: getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim(),
          borderColor: getComputedStyle(document.documentElement).getPropertyValue('--light-color').trim(),
          borderWidth: 1,
          callbacks: {
            title: function(tooltipItems) {
              return 'Date: ' + tooltipItems[0].label;
            },
            label: function(context) {
              return 'New Cases: ' + formatNumber(context.raw);
            }
          }
        }
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: 'Date (Month/Day)',
            color: getComputedStyle(document.documentElement).getPropertyValue('--text-light').trim(),
            font: {
              size: 9
            }
          },
          ticks: {
            display: true,
            color: getComputedStyle(document.documentElement).getPropertyValue('--text-light').trim(),
            font: {
              size: 8
            },
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: 3
          },
          grid: {
            display: false
          }
        },
        y: {
          display: true,
          title: {
            display: true,
            text: 'New Cases',
            color: getComputedStyle(document.documentElement).getPropertyValue('--text-light').trim(),
            font: {
              size: 9
            }
          },
          ticks: {
            display: true,
            color: getComputedStyle(document.documentElement).getPropertyValue('--text-light').trim(),
            font: {
              size: 8
            },
            maxTicksLimit: 3,
            callback: function(value) {
              return formatNumber(value);
            }
          },
          grid: {
            color: getComputedStyle(document.documentElement).getPropertyValue('--light-color').trim() + '33',
            drawBorder: false
          }
        }
      },
      elements: {
        point: {
          radius: 0,
          hitRadius: 10,
          hoverRadius: 4
        }
      }
    }
  });
}

// Update disease details section
function updateDiseaseDetails(diseaseId) {
  currentDisease = diseaseId;
  const disease = diseaseData[diseaseId];

  if (!disease) return;

  // Update stats
  document.getElementById('disease-total-cases').textContent = formatNumber(disease.totalCases);
  document.getElementById('disease-fatalities').textContent = formatNumber(disease.fatalitiesCount);

  const fatalityRate = (disease.fatalitiesCount / disease.totalCases * 100).toFixed(2);
  document.getElementById('disease-fatality-rate').textContent = `${fatalityRate}%`;

  // Calculate average R0 from variants
  const avgR0 = disease.genomicData.variants.reduce((sum, variant) => {
    return sum + (variant.r0 * (variant.percentage / 100));
  }, 0).toFixed(2);
  document.getElementById('disease-r0').textContent = avgR0;

  // Update the disease heading with the actual disease name, styled with HTML
  document.querySelector('.disease-info-container h3').innerHTML = `About <span class="disease-name-highlight">${disease.name}</span>`;

  // Add disease information based on the selected disease
  updateDiseaseInformation(diseaseId);

  // Update charts
  updateTimelineChart(disease);
  updateGeoChart(disease);
}

// Add detailed disease information
function updateDiseaseInformation(diseaseId) {
  // Disease-specific information mapping
  const diseaseInfo = {
    'mpox-2024': {
      description: "Monkeypox is a zoonotic disease caused by the monkeypox virus, belonging to the Orthopoxvirus genus. The 2024 outbreak represents a concerning evolution with increased human-to-human transmission compared to historical patterns.",
      transmission: "Direct contact with infected animals or humans, bodily fluids, contaminated materials, and respiratory droplets during prolonged face-to-face contact.",
      incubation: "5-21 days, typically 6-13 days",
      symptoms: "Fever, headache, muscle aches, back pain, swollen lymph nodes, followed by a distinctive rash that evolves through several stages",
      prevention: "Avoid contact with infected animals or humans, practice good hand hygiene, use PPE when caring for patients, and vaccination for high-risk groups.",
      alerts: "WHO has declared a Public Health Emergency of International Concern due to the rapid spread across multiple regions and emergence of new transmission patterns."
    },
    'h5n1-2024': {
      description: "Highly pathogenic avian influenza (HPAI) H5N1 is primarily a disease of birds, but the 2024 strain shows concerning adaptations enabling more efficient transmission between mammals, raising pandemic potential.",
      transmission: "Contact with infected birds or their environments, limited human-to-human transmission in close contacts. Recent cases show possible airborne spread in mammals.",
      incubation: "2-8 days, typically 3-5 days",
      symptoms: "High fever, cough, severe respiratory difficulties, pneumonia, multi-organ failure in severe cases",
      prevention: "Avoid contact with sick or dead birds, thorough cooking of poultry products, vaccination of poultry, use of personal protective equipment when handling birds.",
      alerts: "FAO and WHO have issued a joint warning about the pandemic potential of current H5N1 strains with recommendations for enhanced surveillance and containment."
    },
    'sarscov2': {
      description: "SARS-CoV-2 is a coronavirus that causes COVID-19. Despite widespread vaccination efforts, the virus continues to evolve, producing variants that partially evade immunity from prior infection and vaccination.",
      transmission: "Respiratory droplets and aerosols, with some evidence of fomite transmission. High transmissibility, especially in indoor settings with poor ventilation.",
      incubation: "2-14 days, typically 5-6 days",
      symptoms: "Fever, cough, fatigue, loss of smell or taste, shortness of breath, ranging from mild to severe",
      prevention: "Vaccination, mask-wearing in high-risk settings, adequate ventilation, physical distancing, hand hygiene",
      alerts: "Current variants demonstrate immune evasion capabilities. Health authorities recommend updated booster doses targeting circulating variants, especially for vulnerable populations."
    },
    'ebolavirus': {
      description: "Ebola virus disease is a severe, often fatal illness affecting humans and other primates. The 2024 outbreak involves the Zaire ebolavirus species, the most lethal strain of the virus.",
      transmission: "Direct contact with blood, secretions, or other bodily fluids of infected people or animals, and with surfaces contaminated with these fluids.",
      incubation: "2-21 days, typically 8-10 days",
      symptoms: "Sudden fever, fatigue, muscle pain, headache, and sore throat, followed by vomiting, diarrhea, rash, and both internal and external bleeding",
      prevention: "Avoid contact with infected individuals, practice careful hygiene, use protective equipment when caring for patients, safe burial practices, vaccination in affected areas",
      alerts: "CDC and WHO have deployed rapid response teams to affected regions. Ring vaccination strategy is being implemented in outbreak epicenters."
    },
    'dengue': {
      description: "Dengue is a mosquito-borne viral disease that has rapidly spread in tropical and subtropical regions. The current outbreak demonstrates unusual intensity and geographic spread.",
      transmission: "Primarily transmitted by female Aedes aegypti mosquitoes and, to a lesser extent, Ae. albopictus. No direct person-to-person transmission.",
      incubation: "3-14 days, typically 4-7 days",
      symptoms: "High fever, severe headache, pain behind the eyes, joint and muscle pain, rash, mild bleeding (nose or gums)",
      prevention: "Vector control measures, personal protection from mosquito bites (repellents, appropriate clothing, mosquito nets), environmental management to reduce breeding sites",
      alerts: "PAHO has issued alerts for several Latin American countries experiencing abnormally high case counts. Climate change is contributing to expanded mosquito habitats."
    },
    'zika': {
      description: "Zika virus disease is caused by a virus transmitted primarily by Aedes mosquitoes. While symptoms are generally mild, Zika virus infection during pregnancy can cause severe birth defects.",
      transmission: "Primarily through infected Aedes mosquitoes. Can also be transmitted through sexual contact and from mother to fetus during pregnancy.",
      incubation: "3-14 days",
      symptoms: "Mild fever, rash, conjunctivitis, muscle and joint pain, malaise, headache. Many infections are asymptomatic.",
      prevention: "Protection against mosquito bites, elimination of breeding sites, use of condoms to prevent sexual transmission, postponing travel to affected areas for pregnant women",
      alerts: "WHO has highlighted recent unexpected spread to previously unaffected regions. Particular vigilance is recommended for pregnant women in endemic areas."
    }
  };

  // Get disease specific information or use placeholder
  const info = diseaseInfo[diseaseId] || {
    description: "Detailed information about this disease is being compiled.",
    transmission: "Information not available.",
    incubation: "Information not available.",
    symptoms: "Information not available.",
    prevention: "Information not available.",
    alerts: "No current alerts for this disease."
  };

  // Update disease information elements
  document.getElementById('disease-description').textContent = info.description;
  document.getElementById('disease-transmission').textContent = info.transmission;
  document.getElementById('disease-incubation').textContent = info.incubation;
  document.getElementById('disease-symptoms').textContent = info.symptoms;
  document.getElementById('disease-prevention').textContent = info.prevention;

  // Update alerts with appropriate styling based on disease severity
  const alertsElement = document.getElementById('disease-alerts');
  alertsElement.textContent = info.alerts;

  // Apply different styling based on disease severity
  if (diseaseId === 'h5n1-2024' || diseaseId === 'ebolavirus') {
    alertsElement.className = 'p-4 border-l-4 border-red-500 bg-red-50 text-red-700';
  } else if (diseaseId === 'mpox-2024' || diseaseId === 'dengue') {
    alertsElement.className = 'p-4 border-l-4 border-orange-500 bg-orange-50 text-orange-700';
  } else if (diseaseId === 'sarscov2') {
    alertsElement.className = 'p-4 border-l-4 border-yellow-500 bg-yellow-50 text-yellow-700';
  } else if (diseaseId === 'zika') {
    alertsElement.className = 'p-4 border-l-4 border-blue-500 bg-blue-50 text-blue-700';
  } else {
    alertsElement.className = 'p-4 border-l-4 border-gray-500 bg-gray-50 text-gray-700';
  }
}

// Update the timeline chart in disease details
function updateTimelineChart(disease) {
  const chartElement = document.getElementById('disease-timeline-chart');

  if (!chartElement) {
    console.error('Timeline chart element not found');
    return;
  }

  const ctx = chartElement.getContext('2d');

  // Destroy existing chart if it exists
  if (chartsInstances['disease-timeline-chart']) {
    chartsInstances['disease-timeline-chart'].destroy();
  }

  // Extract data for the chart
  const labels = disease.timeline.map(item => {
    const date = new Date(item.date);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  });

  const data = disease.timeline.map(item => item.newCases);

  // Get theme colors from CSS variables
  const secondaryColor = getComputedStyle(document.documentElement).getPropertyValue('--secondary-color').trim();
  const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim();
  const lightColor = getComputedStyle(document.documentElement).getPropertyValue('--light-color').trim();

  // Create the chart
  chartsInstances['disease-timeline-chart'] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'New Cases',
        data: data,
        borderColor: secondaryColor || '#3498db',
        backgroundColor: secondaryColor ? `${secondaryColor}33` : 'rgba(52, 152, 219, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: textColor || '#2c3e50'
          }
        },
        tooltip: {
          enabled: true,
          backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--card-color').trim(),
          titleColor: textColor || '#2c3e50',
          bodyColor: textColor || '#2c3e50'
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: textColor || '#2c3e50'
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            color: lightColor ? `${lightColor}33` : 'rgba(0, 0, 0, 0.05)'
          },
          ticks: {
            color: textColor || '#2c3e50'
          }
        }
      }
    }
  });
}

// Update the geographic distribution chart
function updateGeoChart(disease) {
  const chartElement = document.getElementById('disease-geo-chart');

  if (!chartElement) {
    console.error('Geo chart element not found');
    return;
  }

  const ctx = chartElement.getContext('2d');

  // Destroy existing chart if it exists
  if (chartsInstances['disease-geo-chart']) {
    chartsInstances['disease-geo-chart'].destroy();
  }

  // Extract data for the chart
  const labels = Object.keys(disease.countries);
  const data = Object.values(disease.countries);

  // Create color array with the first country highlighted using CSS variables
  const secondaryDark = getComputedStyle(document.documentElement).getPropertyValue('--secondary-600').trim() || '#3d677d';
  const secondaryLight = getComputedStyle(document.documentElement).getPropertyValue('--secondary-300').trim() || '#95becb';

  const backgroundColors = labels.map((_, index) =>
    index === 0 ? secondaryDark : secondaryLight
  );

  // Create the chart
  chartsInstances['disease-geo-chart'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Cases by Country',
        data: data,
        backgroundColor: backgroundColors,
        borderColor: 'rgba(0, 0, 0, 0)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      height: 300,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          }
        }
      }
    }
  });
}

// Update genomics data
function updateGenomicsData(diseaseId) {
  const disease = diseaseData[diseaseId];

  if (!disease) return;

  // Update variants chart
  updateVariantsChart(disease);

  // Update variants table
  updateVariantsTable(disease);
}

// Update the variants chart in genomics section
function updateVariantsChart(disease) {
  const ctx = document.getElementById('variants-chart').getContext('2d');

  // Destroy existing chart if it exists
  if (chartsInstances['variants-chart']) {
    chartsInstances['variants-chart'].destroy();
  }

  // Extract data for the chart
  const labels = disease.genomicData.variants.map(v => v.name);
  const data = disease.genomicData.variants.map(v => v.percentage);

  // Use specified colors for variant charts
  const colors = [
    '#a6c9b8',
    '#649baf',
    '#aeaac9',
    '#ecc188',
    'rgba(230, 126, 34, 0.8)' // keep one backup color in case there are more variants
  ];

  // Create the chart
  chartsInstances['variants-chart'] = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: colors.slice(0, data.length),
        borderColor: '#ffffff',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.label}: ${context.raw}%`;
            }
          }
        }
      }
    }
  });
}

// Update the variants table
function updateVariantsTable(disease) {
  const tableBody = document.getElementById('variants-table-body');
  tableBody.innerHTML = '';

  // Create mutation data for each variant (for demo purposes)
  const mutationData = {
    "Clade I": [
      { gene: "S", position: 484, original: "E", mutation: "K", effect: "Receptor binding" },
      { gene: "S", position: 501, original: "N", mutation: "Y", effect: "Increased transmissibility" },
      { gene: "N", position: 203, original: "R", mutation: "K", effect: "Nucleocapsid stability" }
    ],
    "Clade II": [
      { gene: "S", position: 452, original: "L", mutation: "R", effect: "Immune escape" },
      { gene: "S", position: 478, original: "T", mutation: "K", effect: "Receptor binding" },
      { gene: "ORF1ab", position: 4715, original: "P", mutation: "L", effect: "Replication efficiency" },
      { gene: "S", position: 614, original: "D", mutation: "G", effect: "Spike stability" }
    ],
    "Clade III": [
      { gene: "S", position: 417, original: "K", mutation: "N", effect: "Receptor binding" },
      { gene: "S", position: 681, original: "P", mutation: "H", effect: "Furin cleavage" }
    ],
    "DENV-1": [
      { gene: "E", position: 204, original: "L", mutation: "F", effect: "Envelope structure" },
      { gene: "NS1", position: 123, original: "A", mutation: "V", effect: "Immune evasion" }
    ],
    "DENV-2": [
      { gene: "prM", position: 53, original: "H", mutation: "Q", effect: "Virion assembly" },
      { gene: "NS5", position: 401, original: "R", mutation: "K", effect: "RNA replication" }
    ],
    "DENV-3": [
      { gene: "C", position: 87, original: "T", mutation: "M", effect: "Capsid structure" },
      { gene: "NS3", position: 250, original: "S", mutation: "T", effect: "Protease activity" }
    ],
    "DENV-4": [
      { gene: "E", position: 345, original: "N", mutation: "Y", effect: "Receptor binding" }
    ],
    "JN.1": [
      { gene: "S", position: 339, original: "G", mutation: "H", effect: "Immune escape" },
      { gene: "S", position: 346, original: "R", mutation: "T", effect: "Receptor binding" },
      { gene: "S", position: 444, original: "K", mutation: "T", effect: "Neutralization resistance" }
    ],
    "XBB.1.5": [
      { gene: "S", position: 486, original: "F", mutation: "P", effect: "Receptor binding" },
      { gene: "S", position: 252, original: "G", mutation: "V", effect: "Immune escape" }
    ],
    "FLiRT": [
      { gene: "S", position: 456, original: "L", mutation: "R", effect: "Receptor binding" },
      { gene: "S", position: 478, original: "T", mutation: "R", effect: "Immune escape" }
    ],
    "Others": [
      { gene: "Various", position: 0, original: "-", mutation: "-", effect: "Multiple effects" }
    ]
  };

  // Add mutations for other variants
  for (const key in disease.genomicData.variants) {
    if (!mutationData[disease.genomicData.variants[key].name]) {
      mutationData[disease.genomicData.variants[key].name] = [
        { gene: "S", position: Math.floor(Math.random() * 1000) + 1, original: "A", mutation: "T", effect: "Unknown" },
        { gene: "N", position: Math.floor(Math.random() * 500) + 1, original: "C", mutation: "G", effect: "Unknown" }
      ];
    }
  }

  disease.genomicData.variants.forEach(variant => {
    const row = document.createElement('tr');

    // Create a string representation of mutations for the table
    const mutations = mutationData[variant.name] || [];
    const mutationText = mutations.map(m => `${m.gene}:${m.original}${m.position}${m.mutation}`).join(', ');

    row.innerHTML = `
      <td>${variant.name}</td>
      <td>${variant.percentage}%</td>
      <td>${variant.r0}</td>
      <td>${mutationText}</td>
    `;

    // Make row clickable to show mutation visualization
    row.style.cursor = 'pointer';
    row.addEventListener('click', () => {
      // Highlight the selected row
      document.querySelectorAll('#variants-table-body tr').forEach(tr => {
        tr.classList.remove('selected-variant');
      });
      row.classList.add('selected-variant');

      // Visualize the mutations
      visualizeMutations(variant.name, mutationData[variant.name] || []);
    });

    tableBody.appendChild(row);
  });

  // Select the first variant by default
  if (disease.genomicData.variants.length > 0) {
    const firstVariant = disease.genomicData.variants[0].name;
    document.querySelector('#variants-table-body tr').classList.add('selected-variant');
    visualizeMutations(firstVariant, mutationData[firstVariant] || []);
  }
}

// Visualize mutations using D3.js
function visualizeMutations(variantName, mutations) {
  const container = document.getElementById('mutation-viz');

  // Clear previous visualization
  container.innerHTML = '';

  if (mutations.length === 0) {
    container.innerHTML = '<p class="genomics-placeholder">No mutation data available for this variant</p>';
    return;
  }

  // Set up visualization dimensions
  const width = container.clientWidth;
  const height = container.clientHeight;
  const margin = { top: 50, right: 30, bottom: 50, left: 80 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Create SVG
  const svg = d3.select('#mutation-viz')
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  // Create a group for the visualization
  const g = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  // Add title
  svg.append('text')
    .attr('x', width / 2)
    .attr('y', 25)
    .attr('text-anchor', 'middle')
    .style('font-family', "'Poppins', sans-serif")
    .style('font-weight', '600')
    .style('fill', getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim())
    .text(`Key Mutations in ${variantName}`);

  // Sort mutations by gene and position
  mutations.sort((a, b) => {
    if (a.gene === b.gene) {
      return a.position - b.position;
    }
    return a.gene.localeCompare(b.gene);
  });

  // Group mutations by gene
  const geneGroups = {};
  mutations.forEach(m => {
    if (!geneGroups[m.gene]) {
      geneGroups[m.gene] = [];
    }
    geneGroups[m.gene].push(m);
  });

  const genes = Object.keys(geneGroups);
  const geneColors = {
    'S': '#649baf',
    'N': '#a6c9b8',
    'E': '#aeaac9',
    'ORF1ab': '#ecc188',
    'M': '#e77c7c',
    'NS1': '#b0a676',
    'NS3': '#76b0a6',
    'NS5': '#a676b0',
    'prM': '#b0766a',
    'C': '#6ab076'
  };

  // Create a genomic coordinate scale
  const xScale = d3.scaleLinear()
    .domain([0, d3.max(mutations, d => d.position) + 100])
    .range([0, innerWidth]);

  // Create the y-scale for genes
  const yScale = d3.scaleBand()
    .domain(genes)
    .range([0, innerHeight])
    .padding(0.3);

  // Add x-axis showing positions
  g.append('g')
    .attr('transform', `translate(0, ${innerHeight})`)
    .call(d3.axisBottom(xScale))
    .selectAll('text')
    .style('fill', getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim());

  // Add y-axis showing genes
  g.append('g')
    .call(d3.axisLeft(yScale))
    .selectAll('text')
    .style('font-weight', 'bold')
    .style('fill', getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim());

  // Add x-axis label
  g.append('text')
    .attr('x', innerWidth / 2)
    .attr('y', innerHeight + 40)
    .attr('text-anchor', 'middle')
    .style('fill', getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim())
    .text('Amino Acid Position');

  // Add y-axis label
  g.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('x', -innerHeight / 2)
    .attr('y', -60)
    .attr('text-anchor', 'middle')
    .style('fill', getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim())
    .text('Gene');

  // Draw gene segments
  genes.forEach(gene => {
    const geneGroup = g.append('g');

    // Draw the gene backbone
    const geneStart = d3.min(geneGroups[gene], d => d.position) - 10;
    const geneEnd = d3.max(geneGroups[gene], d => d.position) + 10;

    geneGroup.append('line')
      .attr('x1', xScale(geneStart))
      .attr('x2', xScale(geneEnd))
      .attr('y1', yScale(gene) + yScale.bandwidth() / 2)
      .attr('y2', yScale(gene) + yScale.bandwidth() / 2)
      .attr('stroke', geneColors[gene] || '#ccc')
      .attr('stroke-width', 4)
      .attr('opacity', 0.6);

    // Draw mutation points
    geneGroups[gene].forEach(mutation => {
      const mutationGroup = geneGroup.append('g')
        .attr('class', 'mutation')
        .attr('transform', `translate(${xScale(mutation.position)}, ${yScale(gene) + yScale.bandwidth() / 2})`)
        .style('cursor', 'pointer')
        .on('mouseover', function(event) {
          // Show tooltip
          const tooltip = d3.select('#mutation-viz')
            .append('div')
            .attr('class', 'mutation-tooltip')
            .style('position', 'absolute')
            .style('background-color', 'rgba(255, 255, 255, 0.9)')
            .style('border', '1px solid #ddd')
            .style('border-radius', '4px')
            .style('padding', '8px')
            .style('box-shadow', '0 2px 5px rgba(0, 0, 0, 0.2)')
            .style('pointer-events', 'none')
            .style('z-index', '10')
            .style('left', `${event.pageX}px`)
            .style('top', `${event.pageY - 70}px`);

          tooltip.html(`
            <strong>${mutation.gene}:${mutation.original}${mutation.position}${mutation.mutation}</strong><br>
            <span>Change: ${mutation.original} → ${mutation.mutation}</span><br>
            <span>Effect: ${mutation.effect}</span>
          `);
        })
        .on('mouseout', function() {
          // Remove tooltip
          d3.select('.mutation-tooltip').remove();
        });

      // Draw mutation circle
      mutationGroup.append('circle')
        .attr('r', 7)
        .attr('fill', geneColors[gene] || '#ccc');

      // Draw mutation text (amino acid change)
      mutationGroup.append('text')
        .attr('x', 0)
        .attr('y', -12)
        .attr('text-anchor', 'middle')
        .style('font-size', '10px')
        .style('fill', getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim())
        .text(`${mutation.original}→${mutation.mutation}`);
    });
  });

  // Add a legend
  const legend = svg.append('g')
    .attr('transform', `translate(${width - margin.right - 100}, ${margin.top})`);

  Object.keys(geneColors).filter(gene => genes.includes(gene)).forEach((gene, i) => {
    legend.append('rect')
      .attr('x', 0)
      .attr('y', i * 20)
      .attr('width', 15)
      .attr('height', 15)
      .attr('fill', geneColors[gene]);

    legend.append('text')
      .attr('x', 20)
      .attr('y', i * 20 + 12)
      .style('font-size', '12px')
      .style('fill', getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim())
      .text(gene);
  });
}

// Initialize predictions data
function initPredictionsData() {
  // For demo purposes, we'll use placeholder data
  // In a real implementation, this would fetch prediction data from an API

  // Initialize the projection chart
  createProjectionChart();

  // Initialize risk matrix placeholder
  initRiskMatrix();

  // Initialize prediction map
  const predictionMap = document.getElementById('prediction-map');
  if (predictionMap) {
    // Small timeout to ensure DOM is fully ready
    setTimeout(() => {
      initPredictionMap(predictionMap);
    }, 100);
  }
}

// Create the projection chart in predictions section
function createProjectionChart() {
  const ctx = document.getElementById('projection-chart').getContext('2d');

  // Sample data for the projection
  const labels = [];
  const actualData = [];
  const projectedData = [];

  // Generate 30 days of data (15 past, 15 future)
  const today = new Date();
  for (let i = -15; i < 15; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    labels.push(`${date.getMonth() + 1}/${date.getDate()}`);

    if (i < 0) {
      actualData.push(Math.round(500 + Math.random() * 300 + i * 20));
      projectedData.push(null);
    } else {
      actualData.push(null);
      // Exponential growth for projection
      projectedData.push(Math.round(800 + Math.pow(1.1, i) * 100));
    }
  }

  // Get CSS variable colors for theming
  const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim();
  const lightColor = getComputedStyle(document.documentElement).getPropertyValue('--light-color').trim();

  // Create the chart
  chartsInstances['projection-chart'] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Actual Cases',
          data: actualData,
          borderColor: '#3498db',
          backgroundColor: 'rgba(52, 152, 219, 0.1)',
          borderWidth: 2,
          tension: 0.4,
          fill: true
        },
        {
          label: 'Projected Cases',
          data: projectedData,
          borderColor: '#e74c3c',
          backgroundColor: 'rgba(231, 76, 60, 0.1)',
          borderWidth: 2,
          borderDash: [5, 5],
          tension: 0.4,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          bottom: 10
        }
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            boxWidth: 12,
            padding: 10,
            color: textColor || '#2c3e50'
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--card-color').trim(),
          titleColor: textColor || '#2c3e50',
          bodyColor: textColor || '#2c3e50'
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: textColor || '#2c3e50',
            maxRotation: 45,
            minRotation: 45,
            font: {
              size: 10
            }
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            color: lightColor ? `${lightColor}33` : 'rgba(0, 0, 0, 0.05)'
          },
          ticks: {
            color: textColor || '#2c3e50',
            font: {
              size: 10
            }
          }
        }
      }
    }
  });
}

// Initialize risk matrix with actual visualization
function initRiskMatrix() {
  const container = document.getElementById('risk-matrix');

  // Create risk matrix visualization
  const matrix = document.createElement('div');
  matrix.className = 'risk-matrix-grid';

  // Define risk levels and colors
  const riskLevels = [
    { level: 'Very High', color: '#c0392b' },
    { level: 'High', color: '#e74c3c' },
    { level: 'Medium', color: '#f39c12' },
    { level: 'Low', color: '#2ecc71' },
    { level: 'Very Low', color: '#27ae60' }
  ];

  // Create matrix grid cells (5x5)
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      const cell = document.createElement('div');
      cell.className = 'risk-cell';

      // Calculate risk level based on position
      // Bottom left is lowest risk, top right is highest
      const riskIndex = Math.min(4, Math.floor((i + j) / 2));
      const risk = riskLevels[4 - riskIndex];

      cell.style.backgroundColor = risk.color;
      cell.style.opacity = 0.6 + (riskIndex * 0.1); // Increase opacity for higher risk

      // Add disease markers based on their risk profiles
      const activePredictionBtn = document.querySelector('.prediction-btn.active');
      const currentDisease = activePredictionBtn ? activePredictionBtn.getAttribute('data-disease') : 'mpox-2024';

      if ((currentDisease === 'h5n1-2024' && i === 4 && j === 4) ||
          (currentDisease === 'ebolavirus' && i === 4 && j === 3)) {
        // Add marker for high-risk diseases
        const marker = document.createElement('div');
        marker.className = 'disease-marker';
        marker.textContent = diseaseData[currentDisease].name.substring(0, 2);
        marker.title = diseaseData[currentDisease].name;
        cell.appendChild(marker);
      } else if ((currentDisease === 'mpox-2024' && i === 3 && j === 3) ||
                (currentDisease === 'dengue' && i === 3 && j === 2)) {
        // Add marker for medium-high risk diseases
        const marker = document.createElement('div');
        marker.className = 'disease-marker';
        marker.textContent = diseaseData[currentDisease].name.substring(0, 2);
        marker.title = diseaseData[currentDisease].name;
        cell.appendChild(marker);
      } else if ((currentDisease === 'sarscov2' && i === 2 && j === 2) ||
                (currentDisease === 'zika' && i === 1 && j === 2)) {
        // Add marker for medium to low risk diseases
        const marker = document.createElement('div');
        marker.className = 'disease-marker';
        marker.textContent = diseaseData[currentDisease].name.substring(0, 2);
        marker.title = diseaseData[currentDisease].name;
        cell.appendChild(marker);
      }

      matrix.appendChild(cell);
    }
  }

  // Add axis labels
  const axisContainer = document.createElement('div');
  axisContainer.className = 'risk-axis-container';

  // X axis (Transmissibility)
  const xAxis = document.createElement('div');
  xAxis.className = 'risk-x-axis';
  xAxis.innerHTML = '<span>Low</span><span>Transmissibility</span><span>High</span>';

  // Y axis (Severity)
  const yAxis = document.createElement('div');
  yAxis.className = 'risk-y-axis';
  yAxis.innerHTML = '<span>High</span><span>Severity</span><span>Low</span>';

  axisContainer.appendChild(xAxis);
  axisContainer.appendChild(matrix);
  axisContainer.appendChild(yAxis);

  // Legend
  const legend = document.createElement('div');
  legend.className = 'risk-legend';

  riskLevels.forEach(risk => {
    const item = document.createElement('div');
    item.className = 'legend-item';

    const colorBox = document.createElement('div');
    colorBox.className = 'legend-color';
    colorBox.style.backgroundColor = risk.color;

    const label = document.createElement('span');
    label.textContent = risk.level;

    item.appendChild(colorBox);
    item.appendChild(label);
    legend.appendChild(item);
  });

  // Clear and append all elements
  container.innerHTML = '';
  container.appendChild(axisContainer);
  container.appendChild(legend);
}

// Update prediction timeframe
function updatePredictionTimeframe(days) {
  console.log(`Updating prediction timeframe to ${days} days`);

  // Update the projection chart based on the selected timeframe
  updateProjectionChart(days);

  // Refresh prediction map with updated data
  const predictionMap = document.getElementById('prediction-map');
  if (predictionMap) {
    initPredictionMap(predictionMap);
  }
}

// Update prediction chart for different timeframes
function updateProjectionChart(days) {
  const ctx = document.getElementById('projection-chart').getContext('2d');
  const daysNum = parseInt(days, 10);

  if (isNaN(daysNum) || !chartsInstances['projection-chart']) {
    return;
  }

  // Get the current disease from the active prediction button
  const activePredictionBtn = document.querySelector('.prediction-btn.active');
  const currentDisease = activePredictionBtn ? activePredictionBtn.getAttribute('data-disease') : 'mpox-2024';

  // Generate new projection data based on timeframe
  const labels = [];
  const actualData = [];
  const projectedData = [];

  // Generate data (past days and future projection)
  const today = new Date();
  const pastDays = Math.floor(daysNum / 2);

  for (let i = -pastDays; i < daysNum; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    labels.push(`${date.getMonth() + 1}/${date.getDate()}`);

    if (i < 0) {
      // Past data (actual)
      const baseline = getBaselineForDisease(currentDisease);
      actualData.push(Math.round(baseline + Math.random() * (baseline * 0.2) + i * (baseline * 0.01)));
      projectedData.push(null);
    } else {
      // Future data (projected)
      actualData.push(null);

      // Calculate growth factor based on disease
      const growthFactor = getGrowthFactorForDisease(currentDisease);
      const baseline = getBaselineForDisease(currentDisease);

      // Exponential growth model with disease-specific parameters
      projectedData.push(Math.round(baseline * Math.pow(growthFactor, i * (daysNum / 30))));
    }
  }

  // Update chart data
  chartsInstances['projection-chart'].data.labels = labels;
  chartsInstances['projection-chart'].data.datasets[0].data = actualData;
  chartsInstances['projection-chart'].data.datasets[1].data = projectedData;
  chartsInstances['projection-chart'].update();
}

// Helper function to get baseline cases for different diseases
function getBaselineForDisease(diseaseId) {
  const baselines = {
    'mpox-2024': 500,
    'h5n1-2024': 400,
    'sarscov2': 2000,
    'ebolavirus': 300,
    'dengue': 1500,
    'zika': 350
  };

  return baselines[diseaseId] || 500;
}

// Helper function to get growth factors for different diseases
function getGrowthFactorForDisease(diseaseId) {
  const growthFactors = {
    'mpox-2024': 1.08,
    'h5n1-2024': 1.12,
    'sarscov2': 1.06,
    'ebolavirus': 1.09,
    'dengue': 1.07,
    'zika': 1.05
  };

  return growthFactors[diseaseId] || 1.08;
}

// Update prediction disease
function updatePredictionDisease(diseaseId) {
  console.log(`Updating prediction disease to ${diseaseId}`);

  // Update current disease
  currentDisease = diseaseId;

  // Get the currently selected timeframe
  const activeTimeframeBtn = document.querySelector('.timeframe-btn.active');
  const days = activeTimeframeBtn ? activeTimeframeBtn.getAttribute('data-days') : '7';

  // Update the projection chart
  updateProjectionChart(days);

  // Update prediction metrics
  const hotspotData = {
    'mpox-2024': [
      { country: 'DR Congo', intensity: 0.9, growthRate: 1.4, coordinates: [21.7587, -4.0383] },
      { country: 'Nigeria', intensity: 0.8, growthRate: 1.3, coordinates: [8.6753, 9.0820] },
      { country: 'Ghana', intensity: 0.7, growthRate: 1.2, coordinates: [1.0232, 7.9465] },
      { country: 'UK', intensity: 0.6, growthRate: 1.1, coordinates: [-0.1278, 51.5074] },
      { country: 'Brazil', intensity: 0.5, growthRate: 1.2, coordinates: [-51.9253, -14.2350] }
    ],
    'h5n1-2024': [
      { country: 'USA', intensity: 0.9, growthRate: 1.6, coordinates: [-95.7129, 37.0902] },
      { country: 'Mexico', intensity: 0.8, growthRate: 1.5, coordinates: [-102.5528, 23.6345] },
      { country: 'China', intensity: 0.7, growthRate: 1.3, coordinates: [104.1954, 35.8617] },
      { country: 'Vietnam', intensity: 0.8, growthRate: 1.4, coordinates: [108.2772, 14.0583] },
      { country: 'Indonesia', intensity: 0.7, growthRate: 1.3, coordinates: [113.9213, -0.7893] }
    ],
    'sarscov2': [
      { country: 'India', intensity: 0.8, growthRate: 1.2, coordinates: [78.9629, 20.5937] },
      { country: 'USA', intensity: 0.7, growthRate: 1.1, coordinates: [-95.7129, 37.0902] },
      { country: 'Brazil', intensity: 0.7, growthRate: 1.3, coordinates: [-51.9253, -14.2350] },
      { country: 'China', intensity: 0.6, growthRate: 1.1, coordinates: [104.1954, 35.8617] },
      { country: 'Russia', intensity: 0.5, growthRate: 1.0, coordinates: [105.3188, 61.5240] }
    ],
    'ebolavirus': [
      { country: 'DR Congo', intensity: 0.9, growthRate: 1.5, coordinates: [21.7587, -4.0383] },
      { country: 'Uganda', intensity: 0.8, growthRate: 1.4, coordinates: [32.2903, 1.3733] },
      { country: 'Sierra Leone', intensity: 0.7, growthRate: 1.3, coordinates: [-11.7799, 8.4606] },
      { country: 'Guinea', intensity: 0.7, growthRate: 1.2, coordinates: [-9.6966, 9.9456] },
      { country: 'Liberia', intensity: 0.6, growthRate: 1.1, coordinates: [-9.4295, 6.4281] }
    ],
    'dengue': [
      { country: 'Brazil', intensity: 0.9, growthRate: 1.3, coordinates: [-51.9253, -14.2350] },
      { country: 'Philippines', intensity: 0.8, growthRate: 1.2, coordinates: [121.7740, 12.8797] },
      { country: 'India', intensity: 0.8, growthRate: 1.3, coordinates: [78.9629, 20.5937] },
      { country: 'Indonesia', intensity: 0.7, growthRate: 1.2, coordinates: [113.9213, -0.7893] },
      { country: 'Mexico', intensity: 0.6, growthRate: 1.1, coordinates: [-102.5528, 23.6345] }
    ],
    'zika': [
      { country: 'Brazil', intensity: 0.8, growthRate: 1.2, coordinates: [-51.9253, -14.2350] },
      { country: 'Colombia', intensity: 0.7, growthRate: 1.1, coordinates: [-74.2973, 4.5709] },
      { country: 'Mexico', intensity: 0.6, growthRate: 1.1, coordinates: [-102.5528, 23.6345] },
      { country: 'Puerto Rico', intensity: 0.6, growthRate: 1.0, coordinates: [-66.5901, 18.2208] },
      { country: 'Honduras', intensity: 0.5, growthRate: 1.0, coordinates: [-86.2419, 15.1998] }
    ]
  };

  // Update prediction metrics with the selected disease's data
  updatePredictionMetrics(hotspotData[diseaseId] || []);

  // Refresh the prediction map
  const predictionMap = document.getElementById('prediction-map');
  if (predictionMap) {
    initPredictionMap(predictionMap);
  }

  // Update the risk matrix
  initRiskMatrix();
}

// Initialize map visualizations
function initMapPlaceholders() {
  // Initialize world map on overview page
  initWorldMap();

  // We'll initialize the prediction map in initPredictionsData instead
  // This ensures it's properly initialized when the user visits the predictions section
}

// Function to add hotspots to the prediction map
function addHotspots(g, projection) {
  const activePredictionBtn = document.querySelector('.prediction-btn.active');
  const diseaseId = activePredictionBtn ? activePredictionBtn.getAttribute('data-disease') : 'mpox-2024';
  const disease = diseaseData[diseaseId];

  if (!disease) return;

  // Define hotspot data for each disease
  const hotspotData = {
    'mpox-2024': [
      { country: 'DR Congo', intensity: 0.9, growthRate: 1.4, coordinates: [21.7587, -4.0383] },
      { country: 'Nigeria', intensity: 0.8, growthRate: 1.3, coordinates: [8.6753, 9.0820] },
      { country: 'Ghana', intensity: 0.7, growthRate: 1.2, coordinates: [1.0232, 7.9465] },
      { country: 'UK', intensity: 0.6, growthRate: 1.1, coordinates: [-0.1278, 51.5074] },
      { country: 'Brazil', intensity: 0.5, growthRate: 1.2, coordinates: [-51.9253, -14.2350] }
    ],
    'h5n1-2024': [
      { country: 'USA', intensity: 0.9, growthRate: 1.6, coordinates: [-95.7129, 37.0902] },
      { country: 'Mexico', intensity: 0.8, growthRate: 1.5, coordinates: [-102.5528, 23.6345] },
      { country: 'China', intensity: 0.7, growthRate: 1.3, coordinates: [104.1954, 35.8617] },
      { country: 'Vietnam', intensity: 0.8, growthRate: 1.4, coordinates: [108.2772, 14.0583] },
      { country: 'Indonesia', intensity: 0.7, growthRate: 1.3, coordinates: [113.9213, -0.7893] }
    ],
    'sarscov2': [
      { country: 'India', intensity: 0.8, growthRate: 1.2, coordinates: [78.9629, 20.5937] },
      { country: 'USA', intensity: 0.7, growthRate: 1.1, coordinates: [-95.7129, 37.0902] },
      { country: 'Brazil', intensity: 0.7, growthRate: 1.3, coordinates: [-51.9253, -14.2350] },
      { country: 'China', intensity: 0.6, growthRate: 1.1, coordinates: [104.1954, 35.8617] },
      { country: 'Russia', intensity: 0.5, growthRate: 1.0, coordinates: [105.3188, 61.5240] }
    ],
    'ebolavirus': [
      { country: 'DR Congo', intensity: 0.9, growthRate: 1.5, coordinates: [21.7587, -4.0383] },
      { country: 'Uganda', intensity: 0.8, growthRate: 1.4, coordinates: [32.2903, 1.3733] },
      { country: 'Sierra Leone', intensity: 0.7, growthRate: 1.3, coordinates: [-11.7799, 8.4606] },
      { country: 'Guinea', intensity: 0.7, growthRate: 1.2, coordinates: [-9.6966, 9.9456] },
      { country: 'Liberia', intensity: 0.6, growthRate: 1.1, coordinates: [-9.4295, 6.4281] }
    ],
    'dengue': [
      { country: 'Brazil', intensity: 0.9, growthRate: 1.3, coordinates: [-51.9253, -14.2350] },
      { country: 'Philippines', intensity: 0.8, growthRate: 1.2, coordinates: [121.7740, 12.8797] },
      { country: 'India', intensity: 0.8, growthRate: 1.3, coordinates: [78.9629, 20.5937] },
      { country: 'Indonesia', intensity: 0.7, growthRate: 1.2, coordinates: [113.9213, -0.7893] },
      { country: 'Mexico', intensity: 0.6, growthRate: 1.1, coordinates: [-102.5528, 23.6345] }
    ],
    'zika': [
      { country: 'Brazil', intensity: 0.8, growthRate: 1.2, coordinates: [-51.9253, -14.2350] },
      { country: 'Colombia', intensity: 0.7, growthRate: 1.1, coordinates: [-74.2973, 4.5709] },
      { country: 'Mexico', intensity: 0.6, growthRate: 1.1, coordinates: [-102.5528, 23.6345] },
      { country: 'Puerto Rico', intensity: 0.6, growthRate: 1.0, coordinates: [-66.5901, 18.2208] },
      { country: 'Honduras', intensity: 0.5, growthRate: 1.0, coordinates: [-86.2419, 15.1998] }
    ]
  };

  // Get hotspots for the current disease
  const hotspots = hotspotData[diseaseId] || [];

  // Disease-specific colors
  const diseaseColors = {
    'mpox-2024': '#8db4a3',
    'h5n1-2024': '#6498ac',
    'sarscov2': '#aeaac9',
    'ebolavirus': '#ecc188',
    'dengue': '#c57c80',
    'zika': '#3a97d3'
  };

  // Calculate next week and next month dates for prediction labels
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  const nextMonth = new Date(today);
  nextMonth.setDate(today.getDate() + 30);

  const formatDate = (date) => {
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  // Add hotspot indicators (area of effect)
  g.selectAll('.hotspot')
    .data(hotspots)
    .enter()
    .append('circle')
    .attr('class', 'hotspot')
    .attr('cx', d => {
      const proj = projection(d.coordinates);
      return proj ? proj[0] : 0;
    })
    .attr('cy', d => {
      const proj = projection(d.coordinates);
      return proj ? proj[1] : 0;
    })
    .attr('r', d => 20 * d.intensity) // Size based on intensity
    .attr('fill', diseaseColors[diseaseId] || '#3498db')
    .attr('fill-opacity', 0.3)
    .attr('stroke', diseaseColors[diseaseId] || '#3498db')
    .attr('stroke-width', 1)
    .attr('stroke-opacity', 0.7);

  // Add second outer ring for high-risk hotspots
  g.selectAll('.hotspot-outer-ring')
    .data(hotspots.filter(h => h.intensity > 0.7))
    .enter()
    .append('circle')
    .attr('class', 'hotspot-outer-ring')
    .attr('cx', d => {
      const proj = projection(d.coordinates);
      return proj ? proj[0] : 0;
    })
    .attr('cy', d => {
      const proj = projection(d.coordinates);
      return proj ? proj[1] : 0;
    })
    .attr('r', d => 25 * d.intensity) // Larger than the main hotspot
    .attr('fill', 'none')
    .attr('stroke', diseaseColors[diseaseId] || '#3498db')
    .attr('stroke-width', 1)
    .attr('stroke-dasharray', '3,3')
    .attr('stroke-opacity', 0.4);

  // Add prediction expansion rings for week and month projections
  hotspots.filter(h => h.intensity > 0.7).forEach(hotspot => {
    // Next week projection ring
    const weekRadius = 15 * hotspot.intensity * hotspot.growthRate;
    g.append('circle')
      .attr('class', 'prediction-ring')
      .attr('cx', () => {
        const proj = projection(hotspot.coordinates);
        return proj ? proj[0] : 0;
      })
      .attr('cy', () => {
        const proj = projection(hotspot.coordinates);
        return proj ? proj[1] : 0;
      })
      .attr('r', weekRadius)
      .attr('fill', 'none')
      .attr('stroke', diseaseColors[diseaseId] || '#3498db')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '5,5')
      .attr('stroke-opacity', 0.6);

    // Add week label
    g.append('text')
      .attr('class', 'prediction-label')
      .attr('x', () => {
        const proj = projection(hotspot.coordinates);
        return proj ? proj[0] + weekRadius - 10 : 0;
      })
      .attr('y', () => {
        const proj = projection(hotspot.coordinates);
        return proj ? proj[1] - 5 : 0;
      })
      .attr('text-anchor', 'end')
      .attr('font-family', "'Inter', sans-serif")
      .attr('font-size', '8px')
      .attr('fill', diseaseColors[diseaseId] || '#3498db')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 0.6)
      .attr('paint-order', 'stroke')
      .text(`${formatDate(nextWeek)}`);

    // Next month projection ring for very high risk areas
    if (hotspot.intensity > 0.8) {
      const monthRadius = 30 * hotspot.intensity * Math.pow(hotspot.growthRate, 2);
      g.append('circle')
        .attr('class', 'prediction-ring')
        .attr('cx', () => {
          const proj = projection(hotspot.coordinates);
          return proj ? proj[0] : 0;
        })
        .attr('cy', () => {
          const proj = projection(hotspot.coordinates);
          return proj ? proj[1] : 0;
        })
        .attr('r', monthRadius)
        .attr('fill', 'none')
        .attr('stroke', diseaseColors[diseaseId] || '#3498db')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '2,4')
        .attr('stroke-opacity', 0.4);

      // Add month label
      g.append('text')
        .attr('class', 'prediction-label')
        .attr('x', () => {
          const proj = projection(hotspot.coordinates);
          return proj ? proj[0] + monthRadius - 10 : 0;
        })
        .attr('y', () => {
          const proj = projection(hotspot.coordinates);
          return proj ? proj[1] - 5 : 0;
        })
        .attr('text-anchor', 'end')
        .attr('font-family', "'Inter', sans-serif")
        .attr('font-size', '8px')
        .attr('fill', diseaseColors[diseaseId] || '#3498db')
        .attr('stroke', '#fff')
        .attr('stroke-width', 2)
        .attr('stroke-opacity', 0.5)
        .attr('paint-order', 'stroke')
        .text(`${formatDate(nextMonth)}`);
    }
  });

  // Add pulsating effect to represent growth (center dots)
  g.selectAll('.hotspot-pulse')
    .data(hotspots)
    .enter()
    .append('circle')
    .attr('class', 'hotspot-pulse')
    .attr('cx', d => {
      const proj = projection(d.coordinates);
      return proj ? proj[0] : 0;
    })
    .attr('cy', d => {
      const proj = projection(d.coordinates);
      return proj ? proj[1] : 0;
    })
    .attr('r', 5)
    .attr('fill', diseaseColors[diseaseId] || '#3498db')
    .attr('fill-opacity', 0.7)
    .attr('stroke', 'white')
    .attr('stroke-width', 1)
    .on('mouseover', function(event, d) {
      // Highlight on hover
      d3.select(this)
        .attr('r', 7)
        .attr('fill-opacity', 1);

      // Create ripple effect
      const cx = parseFloat(d3.select(this).attr('cx'));
      const cy = parseFloat(d3.select(this).attr('cy'));

      g.append('circle')
        .attr('class', 'ripple-effect')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', 5)
        .attr('fill', 'none')
        .attr('stroke', diseaseColors[diseaseId] || '#3498db')
        .attr('stroke-width', 2)
        .attr('stroke-opacity', 0.7)
        .transition()
        .duration(1000)
        .attr('r', 25)
        .attr('stroke-opacity', 0)
        .remove();

      // Show enhanced tooltip
      const tooltip = d3.select('#prediction-map')
        .append('div')
        .attr('class', 'prediction-tooltip')
        .style('position', 'absolute')
        .style('background-color', 'rgba(255, 255, 255, 0.95)')
        .style('border-left', `4px solid ${diseaseColors[diseaseId]}`)
        .style('border-radius', '4px')
        .style('padding', '10px')
        .style('box-shadow', '0 3px 8px rgba(0, 0, 0, 0.15)')
        .style('pointer-events', 'none')
        .style('z-index', '10')
        .style('font-family', "'Inter', sans-serif")
        .style('font-size', '13px')
        .style('max-width', '220px')
        .style('transition', 'opacity 0.2s ease')
        .style('left', `${event.pageX - document.getElementById('prediction-map').getBoundingClientRect().left + 15}px`)
        .style('top', `${event.pageY - document.getElementById('prediction-map').getBoundingClientRect().top - 40}px`);

      // Calculate projections
      const weeklyProjectedCases = Math.round(300 * d.intensity * d.growthRate);
      const monthlyProjectedCases = Math.round(300 * d.intensity * Math.pow(d.growthRate, 4));

      // Determine risk level color
      let riskColor;
      if (d.intensity > 0.8) riskColor = '#e74c3c'; // High risk
      else if (d.intensity > 0.6) riskColor = '#f39c12'; // Medium risk
      else riskColor = '#2ecc71'; // Low risk

      // Enhanced tooltip content
      tooltip.html(`
        <div style="font-weight: 600; margin-bottom: 4px; color: #333; font-size: 14px;">${d.country}</div>
        <div style="color: ${diseaseColors[diseaseId]}; font-weight: 500;">${diseaseData[diseaseId].name}</div>
        <div style="margin-top: 8px; font-weight: 600;">Prediction Metrics:</div>
        <div style="margin-top: 4px;">Risk Level: <span style="font-weight: 600; color: ${riskColor};">${Math.round(d.intensity * 100)}%</span></div>
        <div style="margin-top: 4px;">Growth Rate: <span style="font-weight: 600;">${d.growthRate}x per week</span></div>
        <div style="margin-top: 8px; font-weight: 600;">Projected New Cases:</div>
        <div style="margin-top: 4px;">Next Week: <span style="font-weight: 600;">~${weeklyProjectedCases}</span></div>
        <div style="margin-top: 4px;">Next Month: <span style="font-weight: 600;">~${monthlyProjectedCases}</span></div>
        <div style="margin-top: 8px; font-size: 11px; color: #666;">Projections based on current trends and genomic data</div>
      `);
    })
    .on('mouseout', function() {
      // Reset on mouseout
      d3.select(this)
        .attr('r', 5)
        .attr('fill-opacity', 0.7);

      // Remove tooltip
      d3.select('.prediction-tooltip').remove();
    });

  // Add country labels for major hotspots
  g.selectAll('.hotspot-label')
    .data(hotspots.filter(h => h.intensity > 0.7)) // Only label high-intensity hotspots
    .enter()
    .append('text')
    .attr('class', 'outbreak-label')
    .attr('x', d => {
      const proj = projection(d.coordinates);
      return proj ? proj[0] : 0;
    })
    .attr('y', d => {
      const proj = projection(d.coordinates);
      return proj ? proj[1] + 20 : 0; // Position below the circle
    })
    .attr('text-anchor', 'middle')
    .attr('font-family', "'Inter', sans-serif")
    .attr('font-size', '9px')
    .attr('font-weight', '600')
    .attr('fill', diseaseColors[diseaseId] || '#3498db')
    .attr('stroke', '#ffffff')
    .attr('stroke-width', 2)
    .attr('stroke-opacity', 0.8)
    .attr('paint-order', 'stroke')
    .text(d => d.country);

  // Add a legend for the prediction map
  const legendWidth = 160;
  const legendHeight = 80;
  const legendX = 10;
  const legendY = 210;

  const legend = g.append('g')
    .attr('class', 'map-legend')
    .attr('transform', `translate(${legendX}, ${legendY})`);

  // Legend background
  legend.append('rect')
    .attr('width', legendWidth)
    .attr('height', legendHeight)
    .attr('fill', 'rgba(255, 255, 255, 0.85)')
    .attr('stroke', '#ddd')
    .attr('stroke-width', 1)
    .attr('rx', 4);

  // Legend title
  legend.append('text')
    .attr('x', 10)
    .attr('y', 15)
    .attr('font-family', "'Poppins', sans-serif")
    .attr('font-size', '10px')
    .attr('font-weight', '600')
    .attr('fill', '#333')
    .text('Prediction Legend');

  // Solid circle for current hotspot
  legend.append('circle')
    .attr('cx', 20)
    .attr('cy', 35)
    .attr('r', 6)
    .attr('fill', diseaseColors[diseaseId] || '#3498db')
    .attr('fill-opacity', 0.7)
    .attr('stroke', '#fff')
    .attr('stroke-width', 1);

  legend.append('text')
    .attr('x', 30)
    .attr('y', 38)
    .attr('font-family', "'Inter', sans-serif")
    .attr('font-size', '9px')
    .attr('fill', '#333')
    .text('Current Hotspot');

  // Dashed circle for weekly prediction
  legend.append('circle')
    .attr('cx', 20)
    .attr('cy', 55)
    .attr('r', 10)
    .attr('fill', 'none')
    .attr('stroke', diseaseColors[diseaseId] || '#3498db')
    .attr('stroke-width', 1.5)
    .attr('stroke-dasharray', '5,5')
    .attr('stroke-opacity', 0.6);

  legend.append('text')
    .attr('x', 30)
    .attr('y', 58)
    .attr('font-family', "'Inter', sans-serif")
    .attr('font-size', '9px')
    .attr('fill', '#333')
    .text('1-Week Prediction');

  // Dotted circle for monthly prediction
  legend.append('circle')
    .attr('cx', 20)
    .attr('cy', 75)
    .attr('r', 15)
    .attr('fill', 'none')
    .attr('stroke', diseaseColors[diseaseId] || '#3498db')
    .attr('stroke-width', 1)
    .attr('stroke-dasharray', '2,4')
    .attr('stroke-opacity', 0.4);

  legend.append('text')
    .attr('x', 30)
    .attr('y', 78)
    .attr('font-family', "'Inter', sans-serif")
    .attr('font-size', '9px')
    .attr('fill', '#333')
    .text('1-Month Prediction');

  // Update metrics based on this data
  updatePredictionMetrics(hotspots);
}

// Update prediction metrics based on hotspot data
function updatePredictionMetrics(hotspots) {
  if (!hotspots || hotspots.length === 0) return;

  // Calculate metrics based on hotspot data
  const today = new Date();
  let peakDays = 30 + Math.floor(Math.random() * 30);

  // Find peak date based on most intense hotspot
  const maxIntensity = Math.max(...hotspots.map(h => h.intensity));
  const maxGrowthRate = Math.max(...hotspots.map(h => h.growthRate));

  // Adjust peak date based on growth rate - faster growing outbreaks peak sooner
  peakDays = Math.max(14, Math.floor(60 / maxGrowthRate));

  // Set peak date
  const peakDate = new Date(today);
  peakDate.setDate(peakDate.getDate() + peakDays);
  document.getElementById('peak-date').textContent = peakDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  // Calculate peak cases - higher intensity means more cases
  const baselineCases = 2500 + Math.floor(Math.random() * 2000);
  const peakCases = Math.floor(baselineCases * maxIntensity * maxGrowthRate);
  document.getElementById('peak-cases').textContent = `~${formatNumber(peakCases)}`;

  // Set growth rate from data
  document.getElementById('growth-rate').textContent = maxGrowthRate.toFixed(2);

  // Set confidence level - we could make this more sophisticated
  const confidence = 60 + Math.floor(maxIntensity * 25);
  document.getElementById('confidence').textContent = `${confidence}%`;
}

// Function to initialize the prediction map
function initPredictionMap(container) {
  // Clear previous content
  container.innerHTML = '';

  // Width and height for the map visualization
  const width = container.clientWidth;
  const height = 300;

  // Create SVG element
  const svg = d3.select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'xMidYMid meet');

  // Create a group for the map
  const g = svg.append('g');

  // Add a background ocean fill
  g.append('rect')
    .attr('width', width)
    .attr('height', height)
    .attr('fill', '#e6f2f5')
    .attr('stroke', 'none');

  // Define map projection - adjusted scale for better fit
  const projection = d3.geoEquirectangular()
    .scale(width / 6.5)
    .translate([width / 2, height / 2]);

  // Create path generator
  const path = d3.geoPath()
    .projection(projection);

  // Add graticule (longitude/latitude grid lines)
  const graticule = d3.geoGraticule()
    .step([15, 15]);

  g.append("path")
    .datum(graticule)
    .attr("class", "graticule")
    .attr("d", path)
    .attr("fill", "none")
    .attr("stroke", "#cccccc")
    .attr("stroke-width", 0.3)
    .attr("stroke-dasharray", "2,2")
    .attr("stroke-opacity", 0.5);

  // Load world map data
  fetch('https://unpkg.com/world-atlas@2/countries-110m.json')
    .then(response => {
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`);
      }
      return response.json();
    })
    .then(world => {
      try {
        console.log("Prediction map data loaded successfully");

        // Convert TopoJSON to GeoJSON
        const countries = topojson.feature(world, world.objects.countries).features;

        // Create data structure for identifying countries by id
        const countryNames = {};
        try {
          // Try to fetch country names (if available)
          const countriesData = world.objects.countries.geometries;
          if (countriesData && countriesData.length > 0) {
            countriesData.forEach(country => {
              if (country.properties && country.properties.name) {
                countryNames[country.id] = country.properties.name;
              }
            });
          }
        } catch (e) {
          console.warn("Couldn't extract country names from data");
        }

        // Draw countries
        g.selectAll('path.country')
          .data(countries)
          .enter()
          .append('path')
          .attr('class', 'country')
          .attr('d', path)
          .attr('fill', '#f0f0f0')
          .attr('stroke', '#ccc')
          .attr('stroke-width', 0.5)
          .on('mouseover', function(event, d) {
            // Country highlight on hover
            d3.select(this)
              .attr('fill', '#e0e0e0')
              .attr('stroke', '#999')
              .attr('stroke-width', 1);

            // Get country name (if available)
            const countryName = countryNames[d.id] || d.properties?.name || "Unknown region";

            // Basic country tooltip
            const tooltip = d3.select('#prediction-map')
              .append('div')
              .attr('class', 'map-tooltip country-tooltip')
              .style('position', 'absolute')
              .style('background-color', 'rgba(255, 255, 255, 0.9)')
              .style('border-radius', '4px')
              .style('padding', '8px')
              .style('box-shadow', '0 2px 5px rgba(0, 0, 0, 0.2)')
              .style('font-family', "'Inter', sans-serif")
              .style('font-size', '12px')
              .style('pointer-events', 'none')
              .style('z-index', '5')
              .style('left', `${event.pageX - container.getBoundingClientRect().left + 10}px`)
              .style('top', `${event.pageY - container.getBoundingClientRect().top - 25}px`);

            tooltip.html(`<div>${countryName}</div>`);
          })
          .on('mouseout', function() {
            // Reset on mouseout
            d3.select(this)
              .attr('fill', '#f0f0f0')
              .attr('stroke', '#ccc')
              .attr('stroke-width', 0.5);

            // Remove tooltip
            d3.select('.country-tooltip').remove();
          });

        // Add equator line
        const equatorData = {
          type: "LineString",
          coordinates: [[-180, 0], [180, 0]]
        };

        g.append("path")
          .datum(equatorData)
          .attr("class", "equator")
          .attr("d", path)
          .attr("fill", "none")
          .attr("stroke", "rgba(0, 0, 0, 0.2)")
          .attr("stroke-width", 1)
          .attr("stroke-dasharray", "5,5");

        // Add tropics lines
        const tropicCancerData = {
          type: "LineString",
          coordinates: [[-180, 23.5], [180, 23.5]]
        };

        const tropicCapricornData = {
          type: "LineString",
          coordinates: [[-180, -23.5], [180, -23.5]]
        };

        g.append("path")
          .datum(tropicCancerData)
          .attr("class", "tropic")
          .attr("d", path)
          .attr("fill", "none")
          .attr("stroke", "rgba(0, 0, 0, 0.1)")
          .attr("stroke-width", 0.5)
          .attr("stroke-dasharray", "3,3");

        g.append("path")
          .datum(tropicCapricornData)
          .attr("class", "tropic")
          .attr("d", path)
          .attr("fill", "none")
          .attr("stroke", "rgba(0, 0, 0, 0.1)")
          .attr("stroke-width", 0.5)
          .attr("stroke-dasharray", "3,3");

        // Add continental labels
        const continentLabels = [
          { name: "North America", coordinates: [-100.0, 45.0], fontSize: 10 },
          { name: "South America", coordinates: [-60.0, -20.0], fontSize: 10 },
          { name: "Europe", coordinates: [15.0, 50.0], fontSize: 10 },
          { name: "Africa", coordinates: [20.0, 0.0], fontSize: 10 },
          { name: "Asia", coordinates: [100.0, 45.0], fontSize: 10 },
          { name: "Oceania", coordinates: [140.0, -25.0], fontSize: 10 }
        ];

        g.selectAll('.continent-label')
          .data(continentLabels)
          .enter()
          .append('text')
          .attr('class', 'continent-label')
          .attr('x', d => {
            const proj = projection(d.coordinates);
            return proj ? proj[0] : 0;
          })
          .attr('y', d => {
            const proj = projection(d.coordinates);
            return proj ? proj[1] : 0;
          })
          .attr('text-anchor', 'middle')
          .attr('font-family', "'Poppins', sans-serif")
          .attr('font-size', d => d.fontSize || 10)
          .attr('font-weight', '500')
          .attr('fill', 'rgba(50, 50, 50, 0.2)')
          .attr('pointer-events', 'none')
          .text(d => d.name);

        // Add hotspots for the selected disease
        addHotspots(g, projection);

        // Add map border
        svg.append('rect')
          .attr('width', width)
          .attr('height', height)
          .attr('fill', 'none')
          .attr('stroke', '#ccc')
          .attr('stroke-width', 1)
          .attr('pointer-events', 'none');

        // Add zoom controls
        const zoomControlWidth = 24;
        const zoomControls = svg.append('g')
          .attr('class', 'zoom-controls')
          .attr('transform', `translate(10, 10)`);

        // Zoom in button
        const zoomIn = zoomControls.append('g')
          .attr('class', 'zoom-in')
          .attr('cursor', 'pointer')
          .on('click', function() {
            // Implement zoom in
            const currentTransform = d3.zoomTransform(svg.node());
            const newScale = currentTransform.k * 1.3;
            svg.transition().duration(300).call(
              zoom.transform,
              d3.zoomIdentity.translate(currentTransform.x, currentTransform.y).scale(newScale)
            );
          });

        zoomIn.append('rect')
          .attr('width', zoomControlWidth)
          .attr('height', zoomControlWidth)
          .attr('fill', 'rgba(255, 255, 255, 0.9)')
          .attr('stroke', '#ccc')
          .attr('stroke-width', 1)
          .attr('rx', 4);

        zoomIn.append('text')
          .attr('x', zoomControlWidth / 2)
          .attr('y', zoomControlWidth / 2 + 4)
          .attr('text-anchor', 'middle')
          .attr('font-family', "'Inter', sans-serif")
          .attr('font-size', '14px')
          .attr('font-weight', '700')
          .attr('fill', '#666')
          .text('+');

        // Zoom out button
        const zoomOut = zoomControls.append('g')
          .attr('class', 'zoom-out')
          .attr('transform', `translate(0, ${zoomControlWidth + 4})`)
          .attr('cursor', 'pointer')
          .on('click', function() {
            // Implement zoom out
            const currentTransform = d3.zoomTransform(svg.node());
            const newScale = currentTransform.k / 1.3;
            svg.transition().duration(300).call(
              zoom.transform,
              d3.zoomIdentity.translate(currentTransform.x, currentTransform.y).scale(newScale)
            );
          });

        zoomOut.append('rect')
          .attr('width', zoomControlWidth)
          .attr('height', zoomControlWidth)
          .attr('fill', 'rgba(255, 255, 255, 0.9)')
          .attr('stroke', '#ccc')
          .attr('stroke-width', 1)
          .attr('rx', 4);

        zoomOut.append('text')
          .attr('x', zoomControlWidth / 2)
          .attr('y', zoomControlWidth / 2 + 4)
          .attr('text-anchor', 'middle')
          .attr('font-family', "'Inter', sans-serif")
          .attr('font-size', '14px')
          .attr('font-weight', '700')
          .attr('fill', '#666')
          .text('-');

        // Reset zoom button
        const resetZoom = zoomControls.append('g')
          .attr('class', 'reset-zoom')
          .attr('transform', `translate(0, ${(zoomControlWidth + 4) * 2})`)
          .attr('cursor', 'pointer')
          .on('click', function() {
            // Reset to initial zoom level
            svg.transition().duration(500).call(
              zoom.transform,
              d3.zoomIdentity.scale(0.9).translate(width/10, height/10)
            );
          });

        resetZoom.append('rect')
          .attr('width', zoomControlWidth)
          .attr('height', zoomControlWidth)
          .attr('fill', 'rgba(255, 255, 255, 0.9)')
          .attr('stroke', '#ccc')
          .attr('stroke-width', 1)
          .attr('rx', 4);

        resetZoom.append('text')
          .attr('x', zoomControlWidth / 2)
          .attr('y', zoomControlWidth / 2 + 3)
          .attr('text-anchor', 'middle')
          .attr('font-family', "'Inter', sans-serif")
          .attr('font-size', '10px')
          .attr('font-weight', '700')
          .attr('fill', '#666')
          .text('⟲');

        // Add compass
        const compassSize = 24;
        const compass = svg.append('g')
          .attr('class', 'compass')
          .attr('transform', `translate(${width - compassSize - 10}, 20)`);

        compass.append('circle')
          .attr('cx', compassSize / 2)
          .attr('cy', compassSize / 2)
          .attr('r', compassSize / 2)
          .attr('fill', 'rgba(255, 255, 255, 0.8)')
          .attr('stroke', '#ccc')
          .attr('stroke-width', 1);

        compass.append('path')
          .attr('d', `M${compassSize/2},5 L${compassSize/2 - 7},${compassSize - 5} L${compassSize/2},${compassSize - 10} L${compassSize/2 + 7},${compassSize - 5} Z`)
          .attr('fill', '#666')
          .attr('stroke', '#fff')
          .attr('stroke-width', 1);

        compass.append('text')
          .attr('x', compassSize / 2)
          .attr('y', compassSize / 2 + 3)
          .attr('text-anchor', 'middle')
          .attr('font-family', "'Inter', sans-serif")
          .attr('font-size', '10px')
          .attr('font-weight', '700')
          .attr('fill', '#fff')
          .text('N');

        // Add zoom functionality with limits and better initialization
        const zoom = d3.zoom()
          .scaleExtent([0.7, 8]) // Allow more zoom levels
          .on('zoom', (event) => {
            g.attr('transform', event.transform);

            // Adjust font sizes for labels based on zoom level
            const currentScale = event.transform.k;

            // Scale labels inversely to the zoom to keep them readable
            g.selectAll('.continent-label, .outbreak-label')
              .style('font-size', function() {
                const baseSize = parseFloat(d3.select(this).attr('font-size') || 10);
                return `${baseSize / currentScale}px`;
              });
          });

        // Initialize with a slight zoom out to see the whole world
        svg.call(zoom)
           .call(zoom.transform, d3.zoomIdentity.scale(0.9).translate(width/10, height/10));

      } catch (err) {
        console.error("Error processing prediction map data:", err);
        container.innerHTML = `
          <div style="display: flex; height: 100%; align-items: center; justify-content: center; flex-direction: column; text-align: center;">
            <p style="margin-bottom: 10px;">Error loading prediction map</p>
            <p style="color: var(--text-light); font-size: 12px;">Failed to process map data</p>
          </div>
        `;
      }
    })
    .catch(error => {
      console.error('Error loading prediction map data:', error);
      container.innerHTML = `
        <div style="display: flex; height: 100%; align-items: center; justify-content: center; flex-direction: column; text-align: center;">
          <p style="margin-bottom: 10px;">Error loading prediction map</p>
          <p style="color: var(--text-light); font-size: 12px;">Unable to load the world map data</p>
        </div>
      `;
    });
}

// Initialize world map visualization
function initWorldMap() {
  const worldMapContainer = document.getElementById('world-map');
  const diseaseCheckboxesContainer = document.getElementById('map-disease-checkboxes');

  if (!worldMapContainer || !diseaseCheckboxesContainer) return;

  // Ensure the map container is properly sized to its parent
  worldMapContainer.style.width = '100%';

  // Define disease colors with user-specified values
  const diseaseColors = {
    'mpox-2024': '#8db4a3',
    'h5n1-2024': '#6498ac',
    'sarscov2': '#aeaac9',
    'ebolavirus': '#ecc188',
    'dengue': '#c57c80',
    'zika': '#3a97d3'
  };

  // Selected diseases (all selected by default)
  let selectedDiseases = Object.keys(diseaseData);

  // Create disease selection checkboxes
  Object.keys(diseaseData).forEach(diseaseId => {
    const disease = diseaseData[diseaseId];
    const checkboxItem = document.createElement('div');
    checkboxItem.className = 'disease-checkbox-item';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `map-disease-${diseaseId}`;
    checkbox.value = diseaseId;
    checkbox.checked = true;

    checkbox.addEventListener('change', function() {
      if (this.checked) {
        if (!selectedDiseases.includes(diseaseId)) {
          selectedDiseases.push(diseaseId);
        }
      } else {
        selectedDiseases = selectedDiseases.filter(d => d !== diseaseId);
      }
      updateWorldMap();
    });

    const label = document.createElement('label');
    label.htmlFor = `map-disease-${diseaseId}`;

    const colorIndicator = document.createElement('span');
    colorIndicator.className = 'disease-color-indicator';
    colorIndicator.style.backgroundColor = diseaseColors[diseaseId] || '#cccccc';

    label.appendChild(colorIndicator);
    label.appendChild(document.createTextNode(disease.name));

    checkboxItem.appendChild(checkbox);
    checkboxItem.appendChild(label);

    diseaseCheckboxesContainer.appendChild(checkboxItem);
  });

  // Create the map using D3.js
  function updateWorldMap() {
    // Clear previous content
    worldMapContainer.innerHTML = '';

    if (selectedDiseases.length === 0) {
      worldMapContainer.innerHTML = `
        <div style="display: flex; height: 100%; align-items: center; justify-content: center; flex-direction: column; text-align: center;">
          <p style="margin-bottom: 10px;">No diseases selected</p>
          <p style="color: var(--text-light); font-size: 12px;">Select at least one disease to display on the map</p>
        </div>
      `;
      return;
    }

    // Show loading indicator
    worldMapContainer.innerHTML = `
      <div style="display: flex; height: 100%; align-items: center; justify-content: center;">
        <p>Loading map data...</p>
      </div>
    `;

    // Get dimensions
    const width = worldMapContainer.clientWidth;
    const height = worldMapContainer.clientHeight || 380; // Fallback height

    setTimeout(() => {
      // Clear loading indicator
      worldMapContainer.innerHTML = '';

      // Create SVG element
      const svg = d3.select('#world-map')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet');

      // Create a group for the map
      const g = svg.append('g');

      // Add a background ocean fill that fills entire container
      g.append('rect')
        .attr('width', width)
        .attr('height', height)
        .attr('fill', '#e6f2f5')
        .attr('stroke', 'none');

      // Define map projection - adjusted scale for better fit
      const projection = d3.geoEquirectangular()
        .scale(width / 6.5)
        .translate([width / 2, height / 2]);

      // Create path generator
      const path = d3.geoPath()
        .projection(projection);

      // Add graticule (longitude/latitude grid lines)
      const graticule = d3.geoGraticule()
        .step([15, 15]);

      g.append("path")
        .datum(graticule)
        .attr("class", "graticule")
        .attr("d", path)
        .attr("fill", "none")
        .attr("stroke", "#cccccc")
        .attr("stroke-width", 0.3)
        .attr("stroke-dasharray", "2,2")
        .attr("stroke-opacity", 0.5);

      // Load world map data
      fetch('https://unpkg.com/world-atlas@2/countries-110m.json')
        .then(response => {
          if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.status}`);
          }
          return response.json();
        })
        .then(world => {
          try {
            console.log("Map data loaded successfully");

            // Convert TopoJSON to GeoJSON
            const countries = topojson.feature(world, world.objects.countries).features;

            // Create data structure for identifying countries by id
            const countryNames = {};
            try {
              // Try to fetch country names (if available)
              const countriesData = world.objects.countries.geometries;
              if (countriesData && countriesData.length > 0) {
                countriesData.forEach(country => {
                  if (country.properties && country.properties.name) {
                    countryNames[country.id] = country.properties.name;
                  }
                });
              }
            } catch (e) {
              console.warn("Couldn't extract country names from data");
            }

            // Draw countries
            g.selectAll('path.country')
              .data(countries)
              .enter()
              .append('path')
              .attr('class', 'country')
              .attr('d', path)
              .attr('fill', '#f0f0f0')
              .attr('stroke', '#ccc')
              .attr('stroke-width', 0.5)
              .on('mouseover', function(event, d) {
                // Country highlight on hover
                d3.select(this)
                  .attr('fill', '#e0e0e0')
                  .attr('stroke', '#999')
                  .attr('stroke-width', 1);

                // Get country name (if available)
                const countryName = countryNames[d.id] || d.properties?.name || "Unknown region";

                // Basic country tooltip
                const tooltip = d3.select('#world-map')
                  .append('div')
                  .attr('class', 'map-tooltip country-tooltip')
                  .style('position', 'absolute')
                  .style('background-color', 'rgba(255, 255, 255, 0.9)')
                  .style('border-radius', '4px')
                  .style('padding', '8px')
                  .style('box-shadow', '0 2px 5px rgba(0, 0, 0, 0.2)')
                  .style('font-family', "'Inter', sans-serif")
                  .style('font-size', '12px')
                  .style('pointer-events', 'none')
                  .style('z-index', '5')
                  .style('left', `${event.pageX - worldMapContainer.getBoundingClientRect().left + 10}px`)
                  .style('top', `${event.pageY - worldMapContainer.getBoundingClientRect().top - 25}px`);

                tooltip.html(`<div>${countryName}</div>`);
              })
              .on('mouseout', function() {
                // Reset on mouseout
                d3.select(this)
                  .attr('fill', '#f0f0f0')
                  .attr('stroke', '#ccc')
                  .attr('stroke-width', 0.5);

                // Remove tooltip
                d3.select('.country-tooltip').remove();
              });

            // Add major country labels for better orientation
            const majorCountries = [
              { name: "United States", coordinates: [-95.7129, 37.0902], fontSize: 10 },
              { name: "Canada", coordinates: [-106.3468, 56.1304], fontSize: 10 },
              { name: "Brazil", coordinates: [-51.9253, -14.2350], fontSize: 10 },
              { name: "Russia", coordinates: [105.3188, 61.5240], fontSize: 10 },
              { name: "China", coordinates: [104.1954, 35.8617], fontSize: 10 },
              { name: "India", coordinates: [78.9629, 20.5937], fontSize: 10 },
              { name: "Australia", coordinates: [133.7751, -25.2744], fontSize: 10 },
              { name: "Europe", coordinates: [15.2551, 54.5260], fontSize: 9, className: "region-label" }
            ];

            g.selectAll('.country-label')
              .data(majorCountries)
              .enter()
              .append('text')
              .attr('class', d => d.className || 'country-label')
              .attr('x', d => {
                const proj = projection(d.coordinates);
                return proj ? proj[0] : 0;
              })
              .attr('y', d => {
                const proj = projection(d.coordinates);
                return proj ? proj[1] : 0;
              })
              .attr('text-anchor', 'middle')
              .attr('font-family', "'Inter', sans-serif")
              .attr('font-size', d => d.fontSize || 10)
              .attr('fill', '#555')
              .attr('pointer-events', 'none')
              .text(d => d.name);

            // Add continent labels for orientation
            const continents = [
              { name: "North America", coordinates: [-100.0, 45.0], fontSize: 12 },
              { name: "South America", coordinates: [-60.0, -20.0], fontSize: 12 },
              { name: "Europe", coordinates: [15.0, 50.0], fontSize: 12 },
              { name: "Africa", coordinates: [20.0, 0.0], fontSize: 12 },
              { name: "Asia", coordinates: [100.0, 45.0], fontSize: 12 },
              { name: "Oceania", coordinates: [140.0, -25.0], fontSize: 12 }
            ];

            g.selectAll('.continent-label')
              .data(continents)
              .enter()
              .append('text')
              .attr('class', 'continent-label')
              .attr('x', d => {
                const proj = projection(d.coordinates);
                return proj ? proj[0] : 0;
              })
              .attr('y', d => {
                const proj = projection(d.coordinates);
                return proj ? proj[1] : 0;
              })
              .attr('text-anchor', 'middle')
              .attr('font-family', "'Poppins', sans-serif")
              .attr('font-size', d => d.fontSize || 12)
              .attr('font-weight', '500')
              .attr('fill', 'rgba(50, 50, 50, 0.2)')
              .attr('pointer-events', 'none')
              .text(d => d.name);

            // Add major ocean labels
            const oceans = [
              { name: "Pacific Ocean", coordinates: [-150.0, 0.0], fontSize: 11 },
              { name: "Atlantic Ocean", coordinates: [-30.0, 0.0], fontSize: 11 },
              { name: "Indian Ocean", coordinates: [80.0, -15.0], fontSize: 11 }
            ];

            g.selectAll('.ocean-label')
              .data(oceans)
              .enter()
              .append('text')
              .attr('class', 'ocean-label')
              .attr('x', d => {
                const proj = projection(d.coordinates);
                return proj ? proj[0] : 0;
              })
              .attr('y', d => {
                const proj = projection(d.coordinates);
                return proj ? proj[1] : 0;
              })
              .attr('text-anchor', 'middle')
              .attr('font-family', "'Inter', sans-serif")
              .attr('font-style', 'italic')
              .attr('font-size', d => d.fontSize || 11)
              .attr('fill', 'rgba(70, 130, 180, 0.4)')
              .attr('pointer-events', 'none')
              .text(d => d.name);

            // Add equator line
            const equatorData = {
              type: "LineString",
              coordinates: [[-180, 0], [180, 0]]
            };

            g.append("path")
              .datum(equatorData)
              .attr("class", "equator")
              .attr("d", path)
              .attr("fill", "none")
              .attr("stroke", "rgba(0, 0, 0, 0.2)")
              .attr("stroke-width", 1)
              .attr("stroke-dasharray", "5,5");

            // Add tropics lines
            const tropicCancerData = {
              type: "LineString",
              coordinates: [[-180, 23.5], [180, 23.5]]
            };

            const tropicCapricornData = {
              type: "LineString",
              coordinates: [[-180, -23.5], [180, -23.5]]
            };

            g.append("path")
              .datum(tropicCancerData)
              .attr("class", "tropic")
              .attr("d", path)
              .attr("fill", "none")
              .attr("stroke", "rgba(0, 0, 0, 0.1)")
              .attr("stroke-width", 0.5)
              .attr("stroke-dasharray", "3,3");

            g.append("path")
              .datum(tropicCapricornData)
              .attr("class", "tropic")
              .attr("d", path)
              .attr("fill", "none")
              .attr("stroke", "rgba(0, 0, 0, 0.1)")
              .attr("stroke-width", 0.5)
              .attr("stroke-dasharray", "3,3");

            // Create circles for each disease outbreak after map is drawn
            selectedDiseases.forEach(diseaseId => {
              const disease = diseaseData[diseaseId];
              if (!disease || !disease.countries) {
                console.warn(`No country data for disease: ${diseaseId}`);
                return;
              }

              const countries = Object.entries(disease.countries);

              // Prepare data for circles
              const circleData = countries.map(([countryName, cases]) => {
                // Get country coordinates
                const coordinates = getCountryCoordinates(countryName);
                if (!coordinates) {
                  console.warn(`No coordinates found for: ${countryName}`);
                  return null;
                }

                return {
                  countryName,
                  cases,
                  coordinates,
                  disease: disease.name,
                  color: diseaseColors[diseaseId] || '#cccccc',
                  diseaseId
                };
              }).filter(d => d !== null);

              console.log(`Adding ${circleData.length} circles for ${diseaseId}`);

              // Create outlines for larger bubbles first (for a haloed effect)
              g.selectAll(`.circle-outline-${diseaseId}`)
                .data(circleData.filter(d => Math.log(d.cases) * 1.2 > 10)) // Only for larger bubbles
                .enter()
                .append('circle')
                .attr('class', `disease-circle-outline disease-${diseaseId}`)
                .attr('cx', d => {
                  const proj = projection(d.coordinates);
                  return proj ? proj[0] : 0;
                })
                .attr('cy', d => {
                  const proj = projection(d.coordinates);
                  return proj ? proj[1] : 0;
                })
                .attr('r', d => {
                  const baseSize = Math.log(d.cases) * 1.2;
                  return Math.max(3, Math.min(baseSize, 20)) + 2; // Slightly larger than the main circle
                })
                .attr('fill', 'none')
                .attr('stroke', d => d.color)
                .attr('stroke-width', 1)
                .attr('stroke-opacity', 0.3);

              // Add circles to the map - ensure proper sizing
              g.selectAll(`.circle-${diseaseId}`)
                .data(circleData)
                .enter()
                .append('circle')
                .attr('class', `disease-circle disease-${diseaseId}`)
                .attr('cx', d => {
                  const proj = projection(d.coordinates);
                  return proj ? proj[0] : 0;
                })
                .attr('cy', d => {
                  const proj = projection(d.coordinates);
                  return proj ? proj[1] : 0;
                })
                .attr('r', d => {
                  // More reasonable sizing for circles
                  const baseSize = Math.log(d.cases) * 1.2;
                  return Math.max(3, Math.min(baseSize, 20)); // Min 3px, max 20px
                })
                .attr('fill', d => d.color)
                .attr('fill-opacity', 0.7)
                .attr('stroke', '#ffffff')
                .attr('stroke-width', 1)
                .attr('stroke-opacity', 0.7)
                .on('mouseover', function(event, d) {
                  // Highlight on hover
                  d3.select(this)
                    .attr('fill-opacity', 1)
                    .attr('r', d => {
                      const baseSize = Math.log(d.cases) * 1.2;
                      return Math.max(5, Math.min(baseSize + 2, 22));
                    });

                  // Create ripple effect
                  const cx = parseFloat(d3.select(this).attr('cx'));
                  const cy = parseFloat(d3.select(this).attr('cy'));

                  g.append('circle')
                    .attr('class', 'ripple-effect')
                    .attr('cx', cx)
                    .attr('cy', cy)
                    .attr('r', 5)
                    .attr('fill', 'none')
                    .attr('stroke', d.color)
                    .attr('stroke-width', 2)
                    .attr('stroke-opacity', 0.7)
                    .transition()
                    .duration(1000)
                    .attr('r', 25)
                    .attr('stroke-opacity', 0)
                    .remove();

                  // Add enhanced tooltip
                  const tooltip = d3.select('#world-map')
                    .append('div')
                    .attr('class', 'map-tooltip')
                    .style('position', 'absolute')
                    .style('background-color', 'rgba(255, 255, 255, 0.95)')
                    .style('border-left', `4px solid ${d.color}`)
                    .style('border-radius', '4px')
                    .style('padding', '12px')
                    .style('box-shadow', '0 3px 8px rgba(0, 0, 0, 0.15)')
                    .style('pointer-events', 'none')
                    .style('z-index', '10')
                    .style('font-family', "'Inter', sans-serif")
                    .style('font-size', '13px')
                    .style('transition', 'opacity 0.2s ease')
                    .style('max-width', '220px')
                    .style('left', `${event.pageX - worldMapContainer.getBoundingClientRect().left + 15}px`)
                    .style('top', `${event.pageY - worldMapContainer.getBoundingClientRect().top - 40}px`);

                  // Calculate stats for trend
                  const trendIndicator = Math.random() > 0.5 ?
                    `<span style="color: #e74c3c;">↑ Rising</span>` :
                    `<span style="color: #2ecc71;">↓ Declining</span>`;

                  const severityLevel = getSeverityLevel(d.diseaseId);

                  tooltip.html(`
                    <div style="font-weight: 600; margin-bottom: 4px; color: #333; font-size: 14px;">${d.countryName}</div>
                    <div style="color: ${d.color}; font-weight: 500;">${d.disease}</div>
                    <div style="margin-top: 6px;">Confirmed Cases: <span style="font-weight: 600;">${formatNumber(d.cases)}</span></div>
                    <div style="margin-top: 3px;">Trend: ${trendIndicator}</div>
                    <div style="margin-top: 3px;">Risk Level: <span style="font-weight: 500;">${severityLevel}</span></div>
                    <div style="font-size: 11px; margin-top: 8px; color: #666; font-style: italic;">Click for detailed report</div>
                  `);
                })
                .on('mouseout', function() {
                  // Reset on mouseout
                  d3.select(this)
                    .attr('fill-opacity', 0.7)
                    .attr('r', d => {
                      const baseSize = Math.log(d.cases) * 1.2;
                      return Math.max(3, Math.min(baseSize, 20));
                    });

                  // Remove tooltip
                  d3.select('.map-tooltip').remove();
                })
                .on('click', function(event, d) {
                  // Navigate to the details page for this disease
                  const menuItems = document.querySelectorAll('.menu-item');
                  menuItems.forEach(mi => {
                    mi.classList.remove('active');
                    if (mi.getAttribute('data-section') === 'diseases') {
                      mi.classList.add('active');
                    }
                  });

                  // Show diseases section
                  const sections = document.querySelectorAll('.section');
                  sections.forEach(section => {
                    section.classList.remove('active');
                    if (section.id === 'diseases') {
                      section.classList.add('active');
                    }
                  });

                  // Update active disease button
                  const diseaseButtons = document.querySelectorAll('.disease-btn');
                  diseaseButtons.forEach(btn => {
                    btn.classList.remove('active');
                    if (btn.getAttribute('data-disease') === d.diseaseId) {
                      btn.classList.add('active');
                    }
                  });

                  // Update disease details
                  window.updateDiseaseDetails(d.diseaseId);
                });

              // Add text labels for major outbreaks
              g.selectAll(`.label-${diseaseId}`)
                .data(circleData.filter(d => Math.log(d.cases) * 1.2 > 12)) // Only label major outbreaks
                .enter()
                .append('text')
                .attr('class', `outbreak-label disease-${diseaseId}`)
                .attr('x', d => {
                  const proj = projection(d.coordinates);
                  return proj ? proj[0] : 0;
                })
                .attr('y', d => {
                  const proj = projection(d.coordinates);
                  return proj ? proj[1] + 25 : 0; // Position below the circle
                })
                .attr('text-anchor', 'middle')
                .attr('font-family', "'Inter', sans-serif")
                .attr('font-size', '9px')
                .attr('font-weight', '600')
                .attr('fill', d => d.color)
                .attr('stroke', '#ffffff')
                .attr('stroke-width', 2)
                .attr('stroke-opacity', 0.8)
                .attr('paint-order', 'stroke')
                .text(d => {
                  // Show abbreviated pathogen and case count
                  const pathogenShort = d.disease.split(' ')[0];
                  return `${pathogenShort}: ${formatNumber(d.cases)}`;
                });
            });

            // Add map border
            svg.append('rect')
              .attr('width', width)
              .attr('height', height)
              .attr('fill', 'none')
              .attr('stroke', '#ccc')
              .attr('stroke-width', 1)
              .attr('pointer-events', 'none');

            // Add map legend for disease spread intensity
            const legendWidth = 180;
            const legendHeight = 50;
            const legendX = width - legendWidth - 10;
            const legendY = height - legendHeight - 10;

            const legend = svg.append('g')
              .attr('class', 'map-legend')
              .attr('transform', `translate(${legendX}, ${legendY})`);

            // Legend background
            legend.append('rect')
              .attr('width', legendWidth)
              .attr('height', legendHeight)
              .attr('fill', 'rgba(255, 255, 255, 0.85)')
              .attr('stroke', '#ddd')
              .attr('stroke-width', 1)
              .attr('rx', 4);

            // Legend title
            legend.append('text')
              .attr('x', 10)
              .attr('y', 15)
              .attr('font-family', "'Poppins', sans-serif")
              .attr('font-size', '10px')
              .attr('font-weight', '600')
              .attr('fill', '#333')
              .text('Disease Spread Intensity');

            // Legend bubbles
            const sizes = [3, 6, 9, 12, 15];
            sizes.forEach((size, i) => {
              legend.append('circle')
                .attr('cx', 20 + i * 35)
                .attr('cy', 35)
                .attr('r', size)
                .attr('fill', '#666')
                .attr('fill-opacity', 0.6)
                .attr('stroke', '#fff')
                .attr('stroke-width', 1);

              legend.append('text')
                .attr('x', 20 + i * 35)
                .attr('y', 50)
                .attr('text-anchor', 'middle')
                .attr('font-family', "'Inter', sans-serif")
                .attr('font-size', '8px')
                .attr('fill', '#333')
                .text(i === 0 ? 'Low' : i === sizes.length - 1 ? 'High' : '');
            });

            // Add north arrow indicator
            const compassSize = 30;
            const compass = svg.append('g')
              .attr('class', 'compass')
              .attr('transform', `translate(${width - compassSize - 15}, 25)`);

            compass.append('circle')
              .attr('cx', compassSize / 2)
              .attr('cy', compassSize / 2)
              .attr('r', compassSize / 2)
              .attr('fill', 'rgba(255, 255, 255, 0.8)')
              .attr('stroke', '#ccc')
              .attr('stroke-width', 1);

            compass.append('path')
              .attr('d', `M${compassSize/2},5 L${compassSize/2 - 8},${compassSize - 5} L${compassSize/2},${compassSize - 10} L${compassSize/2 + 8},${compassSize - 5} Z`)
              .attr('fill', '#666')
              .attr('stroke', '#fff')
              .attr('stroke-width', 1);

            compass.append('text')
              .attr('x', compassSize / 2)
              .attr('y', compassSize / 2 + 3)
              .attr('text-anchor', 'middle')
              .attr('font-family', "'Inter', sans-serif")
              .attr('font-size', '10px')
              .attr('font-weight', '700')
              .attr('fill', '#fff')
              .text('N');

            // Add zoom controls
            const zoomControlWidth = 30;
            const zoomControls = svg.append('g')
              .attr('class', 'zoom-controls')
              .attr('transform', `translate(15, 15)`);

            // Zoom in button
            const zoomIn = zoomControls.append('g')
              .attr('class', 'zoom-in')
              .attr('cursor', 'pointer')
              .on('click', function() {
                // Implement zoom in
                const currentTransform = d3.zoomTransform(svg.node());
                const newScale = currentTransform.k * 1.3;
                svg.transition().duration(300).call(
                  zoom.transform,
                  d3.zoomIdentity.translate(currentTransform.x, currentTransform.y).scale(newScale)
                );
              });

            zoomIn.append('rect')
              .attr('width', zoomControlWidth)
              .attr('height', zoomControlWidth)
              .attr('fill', 'rgba(255, 255, 255, 0.9)')
              .attr('stroke', '#ccc')
              .attr('stroke-width', 1)
              .attr('rx', 4);

            zoomIn.append('text')
              .attr('x', zoomControlWidth / 2)
              .attr('y', zoomControlWidth / 2 + 5)
              .attr('text-anchor', 'middle')
              .attr('font-family', "'Inter', sans-serif")
              .attr('font-size', '16px')
              .attr('font-weight', '700')
              .attr('fill', '#666')
              .text('+');

            // Zoom out button
            const zoomOut = zoomControls.append('g')
              .attr('class', 'zoom-out')
              .attr('transform', `translate(0, ${zoomControlWidth + 5})`)
              .attr('cursor', 'pointer')
              .on('click', function() {
                // Implement zoom out
                const currentTransform = d3.zoomTransform(svg.node());
                const newScale = currentTransform.k / 1.3;
                svg.transition().duration(300).call(
                  zoom.transform,
                  d3.zoomIdentity.translate(currentTransform.x, currentTransform.y).scale(newScale)
                );
              });

            zoomOut.append('rect')
              .attr('width', zoomControlWidth)
              .attr('height', zoomControlWidth)
              .attr('fill', 'rgba(255, 255, 255, 0.9)')
              .attr('stroke', '#ccc')
              .attr('stroke-width', 1)
              .attr('rx', 4);

            zoomOut.append('text')
              .attr('x', zoomControlWidth / 2)
              .attr('y', zoomControlWidth / 2 + 5)
              .attr('text-anchor', 'middle')
              .attr('font-family', "'Inter', sans-serif")
              .attr('font-size', '16px')
              .attr('font-weight', '700')
              .attr('fill', '#666')
              .text('-');

            // Reset zoom button
            const resetZoom = zoomControls.append('g')
              .attr('class', 'reset-zoom')
              .attr('transform', `translate(0, ${(zoomControlWidth + 5) * 2})`)
              .attr('cursor', 'pointer')
              .on('click', function() {
                // Reset to initial zoom level
                svg.transition().duration(500).call(
                  zoom.transform,
                  d3.zoomIdentity.scale(0.9).translate(width/10, height/10)
                );
              });

            resetZoom.append('rect')
              .attr('width', zoomControlWidth)
              .attr('height', zoomControlWidth)
              .attr('fill', 'rgba(255, 255, 255, 0.9)')
              .attr('stroke', '#ccc')
              .attr('stroke-width', 1)
              .attr('rx', 4);

            resetZoom.append('text')
              .attr('x', zoomControlWidth / 2)
              .attr('y', zoomControlWidth / 2 + 3)
              .attr('text-anchor', 'middle')
              .attr('font-family', "'Inter', sans-serif")
              .attr('font-size', '10px')
              .attr('font-weight', '700')
              .attr('fill', '#666')
              .text('⟲');

            // Add map scale bar
            const scaleBarLength = width / 10;
            const scaleBarHeight = 4;
            const scaleBarX = 20;
            const scaleBarY = height - 20;

            const scaleBar = svg.append('g')
              .attr('class', 'scale-bar')
              .attr('transform', `translate(${scaleBarX}, ${scaleBarY})`);

            scaleBar.append('rect')
              .attr('width', scaleBarLength)
              .attr('height', scaleBarHeight)
              .attr('fill', '#666');

            scaleBar.append('text')
              .attr('x', scaleBarLength / 2)
              .attr('y', -5)
              .attr('text-anchor', 'middle')
              .attr('font-family', "'Inter', sans-serif")
              .attr('font-size', '9px')
              .attr('fill', '#666')
              .text('2000 km');

            // Add zoom functionality with limits and better initialization
            const zoom = d3.zoom()
              .scaleExtent([0.7, 8]) // Allow more zoom levels
              .on('zoom', (event) => {
                g.attr('transform', event.transform);

                // Adjust font sizes for country labels based on zoom level
                const currentScale = event.transform.k;

                // Scale labels inversely to the zoom to keep them readable
                g.selectAll('.country-label, .continent-label, .ocean-label, .outbreak-label')
                  .style('font-size', function() {
                    const baseSize = parseFloat(d3.select(this).attr('font-size') || 10);
                    return `${baseSize / currentScale}px`;
                  });

                // Show/hide elements based on zoom level
                if (currentScale > 3) {
                  // Show minor region labels at high zoom levels
                  g.selectAll('.minor-region').style('display', 'block');
                  g.selectAll('.continent-label').style('display', 'none');
                } else {
                  g.selectAll('.minor-region').style('display', 'none');
                  g.selectAll('.continent-label').style('display', 'block');
                }
              });

            // Initialize with a slight zoom out to see the whole world
            svg.call(zoom)
               .call(zoom.transform, d3.zoomIdentity.scale(0.9).translate(width/10, height/10));

          } catch (err) {
            console.error("Error processing map data:", err);
            showMapError("Error processing map data");
          }
        })
        .catch(error => {
          console.error('Error loading world map data:', error);
          showMapError("Unable to load the world map data");
        });
    }, 100); // Short delay to ensure DOM is ready
  }

  function showMapError(message) {
    worldMapContainer.innerHTML = `
      <div style="display: flex; height: 100%; align-items: center; justify-content: center; flex-direction: column; text-align: center;">
        <p style="margin-bottom: 10px;">Error loading map</p>
        <p style="color: var(--text-light); font-size: 12px;">${message}</p>
      </div>
    `;
  }

  // Helper function to determine severity level based on disease
  function getSeverityLevel(diseaseId) {
    const severityMap = {
      'mpox-2024': 'High',
      'h5n1-2024': 'Critical',
      'sarscov2': 'Moderate',
      'ebolavirus': 'Critical',
      'dengue': 'High',
      'zika': 'Moderate'
    };

    const severityColors = {
      'Critical': '#e74c3c',
      'High': '#e67e22',
      'Moderate': '#f39c12',
      'Low': '#2ecc71'
    };

    const severity = severityMap[diseaseId] || 'Moderate';
    const color = severityColors[severity];

    return `<span style="color: ${color};">${severity}</span>`;
  }

  // Improved country coordinates function
  function getCountryCoordinates(country) {
    const coordinates = {
      'USA': [-95.7129, 37.0902],
      'United States': [-95.7129, 37.0902],
      'UK': [-0.1278, 51.5074],
      'Britain': [-0.1278, 51.5074],
      'Brazil': [-51.9253, -14.2350],
      'China': [104.1954, 35.8617],
      'India': [78.9629, 20.5937],
      'DR Congo': [21.7587, -4.0383],
      'Nigeria': [8.6753, 9.0820],
      'Vietnam': [108.2772, 14.0583],
      'Indonesia': [113.9213, -0.7893],
      'Russia': [105.3188, 61.5240],
      'Mexico': [-102.5528, 23.6345],
      'Philippines': [121.7740, 12.8797],
      'Colombia': [-74.2973, 4.5709],
      'Uganda': [32.2903, 1.3733],
      'Sierra Leone': [-11.7799, 8.4606],
      'Guinea': [-9.6966, 9.9456],
      'Liberia': [-9.4295, 6.4281],
      'France': [2.2137, 46.2276],
      'Germany': [10.4515, 51.1657],
      'Honduras': [-86.2419, 15.1998],
      'Puerto Rico': [-66.5901, 18.2208],
      'Others': [0, 0] // Default for unspecified countries
    };

    return coordinates[country] || null;
  }

  // Initialize map
  console.log("Initializing world map");
  updateWorldMap();

  // Handle window resize
  window.addEventListener('resize', () => {
    // Debounce resize to prevent too many redraws
    clearTimeout(window.resizeTimer);
    window.resizeTimer = setTimeout(() => {
      console.log("Resizing world map");
      updateWorldMap();
    }, 250);
  });
}

// Utility function to format numbers
function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  } else {
    return num.toString();
  }
}