document.addEventListener('DOMContentLoaded', () => {
    // Toggle dropdowns by toggling .active class on group
    document.querySelectorAll('.group > button').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const parent = btn.closest('.group');
        const isActive = parent.classList.contains('active');

        // Close all other dropdowns
        document.querySelectorAll('.group.active').forEach(g => {
          g.classList.remove('active');
        });

        // Toggle current
        if (!isActive) {
          parent.classList.add('active');
        }
      });
    });

    // Close dropdowns on link click
    document.querySelectorAll('a.navigationLink').forEach(link => {
      link.addEventListener('click', () => {
        document.querySelectorAll('.group.active').forEach(group => {
          group.classList.remove('active');
        });
      });
    });

    // Mobile menu toggle
    const mobileToggle = document.getElementById('mobile-menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileToggle && mobileMenu) {
      mobileToggle.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
      });
    }
  });