import React, { useEffect, useState } from 'react';
import { differenceInSeconds, formatDuration, intervalToDuration } from 'date-fns';
import type { Duration } from 'date-fns';
import { Clock } from 'lucide-react';

interface TimerProps {
  targetDate: string | Date;
}

export const Timer: React.FC<TimerProps> = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState<Duration | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const target = new Date(targetDate);

    const calculateTimeLeft = () => {
      const now = new Date();
      const diff = differenceInSeconds(target, now);

      if (diff <= 0) {
        setIsExpired(true);
        setTimeLeft(null);
        return;
      }

      const duration = intervalToDuration({
        start: now,
        end: target,
      });

      setTimeLeft(duration);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (isExpired) {
    return (
      <div className="flex items-center text-red-400 gap-2">
        <Clock className="w-4 h-4" />
        <span>竞猜已结束</span>
      </div>
    );
  }

  if (!timeLeft) return null;

  return (
    <div className="flex items-center text-gray-200 gap-2 animate-pulse">
      <Clock className="w-4 h-4" />
      <span>
        还剩 {timeLeft.days ? `${timeLeft.days} 天 ` : ''}
        {timeLeft.hours ? `${timeLeft.hours} 小时 ` : ''}
        {timeLeft.minutes ? `${timeLeft.minutes} 分钟 ` : ''}
        可以竞猜
      </span>
    </div>
  );
};
