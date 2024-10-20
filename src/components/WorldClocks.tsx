import React, { useState, useEffect } from 'react';

const cities = [
  { name: 'Norwood', timezone: 'America/New_York' },
  { name: 'Bucharest', timezone: 'Europe/Bucharest' },
  { name: 'Hawaii', timezone: 'Pacific/Honolulu' },
  { name: 'San Francisco', timezone: 'America/Los_Angeles' },
  { name: 'Las Vegas', timezone: 'America/Los_Angeles' },
  { name: 'Austin', timezone: 'America/Chicago' },
  { name: 'Rochester', timezone: 'America/New_York' },
  { name: 'New York', timezone: 'America/New_York' },
  { name: 'London', timezone: 'Europe/London' },
  { name: 'Riyadh', timezone: 'Asia/Riyadh' },
  { name: 'Nice', timezone: 'Europe/Paris' },
];

const WorldClocks: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-wrap justify-between text-xs bg-white p-2 rounded-lg shadow-lg">
      {cities.map((city) => (
        <div key={city.name} className="text-center p-1 rolex-clock">
          <div className="city-name">{city.name}</div>
          <div className="time">
            {new Intl.DateTimeFormat('en-US', {
              hour: 'numeric',
              minute: 'numeric',
              second: 'numeric',
              hour12: false,
              timeZone: city.timezone,
            }).format(time)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default WorldClocks;