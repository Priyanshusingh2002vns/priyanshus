export function formatDate(dateString) {
    if (!dateString) {
        return "N/A";
    }
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        return "N/A";
    }
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}


export function formatDateForTime(isoString) {
    const date = new Date(isoString);

    console.log("new date : ", date)

    const options = {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata' // 👈 Ensures UTC time instead of local
    };
    const formatted = date.toLocaleString('en-US', options);
    const [monthDay, Year, time] = formatted.split(', ');

    const [month, day] = monthDay.split(' ');


    return `${day} ${month} ${Year} at ${time}`;
}

export function formatDateMonthDay(dateString) {
    if (!dateString || dateString === "TBD") {
        return "TBD";
    }
    // Match YYYY-MM-DD pattern to format timezone-safely
    const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) {
        const [_, year, month, day] = match;
        const date = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)));
        const monthName = date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
        return `${monthName} ${parseInt(day)}`;
    }
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        return dateString;
    }
    const month = date.toLocaleString('en-US', { month: 'short' });
    const day = date.getDate();
    return `${month} ${day}`;
}

export function formatFullDate(dateString) {
    if (!dateString || dateString === "TBD") {
        return "TBD";
    }
    const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) {
        const [_, year, month, day] = match;
        const date = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)));
        const monthName = date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
        const paddedDay = day.padStart(2, '0');
        return `${monthName} ${paddedDay}, ${year}`;
    }
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        return dateString;
    }
    const paddedDay = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${month} ${paddedDay}, ${year}`;
}