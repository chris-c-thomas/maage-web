<script>
// Toggle advanced search panel
const advancedToggle = document.getElementById('advancedToggle');
const advancedPanel = document.getElementById('advancedPanel');
const chevronDown = document.querySelector('.chevron-down');
const chevronUp = document.querySelector('.chevron-up');

advancedToggle.addEventListener('click', function() {
  const isVisible = advancedPanel.style.display === 'block';

  if (isVisible) {
    advancedPanel.style.display = 'none';
    chevronDown.style.display = 'block';
    chevronUp.style.display = 'none';
  } else {
    advancedPanel.style.display = 'block';
    chevronDown.style.display = 'none';
    chevronUp.style.display = 'block';
  }
});

// Form submission
document.getElementById('searchForm').addEventListener('submit', function(e) {
  e.preventDefault();

  // Get search query
  const searchQuery = document.getElementById('searchQuery').value;

  // Get search type
  const searchTypeEl = document.querySelector('input[name="searchType"]:checked');
  const searchType = searchTypeEl ? searchTypeEl.value : 'all-terms';

  // Get data types
  const dataTypeEls = document.querySelectorAll('input[name="dataType"]:checked');
  const dataTypes = Array.from(dataTypeEls).map(el => el.value);

  // Log search parameters (replace with your actual search implementation)
  console.log('Search query:', searchQuery);
  console.log('Search type:', searchType);
  console.log('Data types:', dataTypes);

  // Here you would typically submit the form or make an API call
  // Example: window.location.href = `/search?q=${encodeURIComponent(searchQuery)}&type=${searchType}&data=${dataTypes.join(',')}`;
});
</script>