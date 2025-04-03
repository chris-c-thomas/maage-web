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

    console.log("Application initialization complete");
  } catch (error) {
    console.error("Error during application initialization:", error);
    alert("There was a problem initializing the application. Please check the console for details.");
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


