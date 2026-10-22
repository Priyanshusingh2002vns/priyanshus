export const formatTimestamp = (timestamp) => {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  
  // Check if date is valid
  if (isNaN(date.getTime())) return '';
  
  // Format: "12:30 PM · Apr 21, 2021"
  const timeOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  };
  
  const dateOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  };
  
  const time = date.toLocaleTimeString('en-US', timeOptions);
  const dateStr = date.toLocaleDateString('en-US', dateOptions);
  
  return `${time} · ${dateStr}`;
};


