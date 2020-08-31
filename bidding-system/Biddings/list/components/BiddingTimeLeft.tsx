import React, { useState, useEffect }   from 'react';
import { createMemo }                   from '@packages/react';
import { TimeLeftWrap }                 from '../../style';

interface BiddingTimeLeftProps {
    endDate: any;
    currentTime?: any;
}

const BiddingTimeLeft = createMemo<BiddingTimeLeftProps>(({ endDate, currentTime }) => {

    const calculateTimeLeft = ( interval? ) => {
        const current = new Date(currentTime.date).getTime();
        let currentLive = 0;

        if ( !interval ) {
            currentLive = current;
            setCurrentTime( current );
        }
        else {
            currentLive = currentTime$ + 1000;
            setCurrentTime( currentLive );
        }

        const difference = new Date(endDate.date).getTime() - currentLive;

        let timeLeft: any = {};

        timeLeft = {
            days:  Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            mins:  Math.floor((difference / 1000 / 60) % 60),
            secs:  Math.floor((difference / 1000) % 60)
        };

        const { days, hours, mins } = timeLeft;

        if ( days < 0 ) {
            setCellClass('expired');
        }
        if ( days === 0 && hours > 0 ) {
            setCellClass('no-days');
        }
        if ( days === 0 && hours === 0 && mins >= 0 ) {
            setCellClass('no-days-and-hours');
        }

        return timeLeft;
    };

    const [ cellClass, setCellClass ] = useState('');
    const [ timeLeft, setTimeLeft ] = useState<any>({});
    const [ currentTime$, setCurrentTime ] = useState(0);

    const renderDigit = ( value ) => {
        let value$ = value;

        if ( value$ < 10 && value$ >= 0 ) {
            value$ = '0' + Math.abs( value$ );
        }

        return value$;
    };

    useEffect(() => {
        setTimeLeft(calculateTimeLeft());

    }, []);

    useEffect(() => {
        let intervalSeconds;
        const dateClosed = (!!cellClass && cellClass === 'expired') ? true : false;

        if ( !dateClosed ) {
            intervalSeconds = setInterval(() => {
                setTimeLeft(calculateTimeLeft(true));
            }, 1000);
        }

        return () => clearInterval(intervalSeconds);
    });

    const renderCountdown = (digit, unit) => {
        return (
            <>
                <span className="digit">
                    { renderDigit( digit ) }
                </span>
                <span className="unit-label">{ unit }</span>
            </>
        );
    };

    const renderExpired = () => {
        return (
            <div className="unit days expired">
                <span className="digit">Bidding Expired!</span>
            </div>
        );
    };

    const renderUnits = ( unit, length ) => {
        let cellClass$ = `unit ${ unit } `;
        const digit = timeLeft[ unit ];

        ( unit === 'days' && (!digit || digit < 0 )) && ( cellClass$ += cellClass );

        return (
            <div key={ `time-left-${ length }` } className={ cellClass$ }>
                { renderCountdown(digit, unit) }
            </div>
        );
    };

    const timerComponents: any = [];

    Object.keys(timeLeft).forEach((interval) => {
        timerComponents.push(
            renderUnits(interval, timerComponents.length)
        );
    });

    return (
        <TimeLeftWrap className={ 'time-left-wrapper' }>
            { cellClass === 'expired' ? renderExpired() : timerComponents }
        </TimeLeftWrap>
    );
}, { displayName: 'BiddingTimeLeft' });

export default BiddingTimeLeft;
