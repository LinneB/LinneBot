export function timeDifference(ms) {
    const date = new Date(ms);
    return {
        years: date.getUTCFullYear() - 1970,
        months: date.getUTCMonth(),
        days: date.getUTCDate() - 1,
        hours: date.getUTCHours(),
        minutes: date.getUTCMinutes(),
        seconds: date.getUTCSeconds(),
    };
}

export function formattedTimeAgoString(dur) {
    const { years, months, days, hours, minutes, seconds } =
        timeDifference(dur);
    if (years > 0) {
        return `${years} ${years > 1 ? "years" : "year"}`;
    }
    if (months > 0) {
        return `${months} ${months > 1 ? "months" : "month"}`;
    }
    if (days > 0) {
        return `${days} ${days > 1 ? "days" : "day"}`;
    }
    if (hours > 0) {
        return `${hours} ${hours > 1 ? "hours" : "hour"}`;
    }
    if (minutes > 0) {
        return `${minutes} ${minutes > 1 ? "minutes" : "minute"}`;
    }
    if (seconds > 0) {
        return `${seconds} ${seconds > 1 ? "seconds" : "second"}`;
    }
    return null;
}

export function truncateString(input, length) {
    if (input.length > length) {
        return length > 3 ? `${input.slice(0, length - 3)}...` : "...";
    }
    return input;
}

export function randomNumber(min, max) {
    return (
        Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min) + 1)) +
        Math.ceil(min)
    );
}

export function randomNumbersUnique(min, max, n) {
    if (max < n) {
        n = max;
    }
    let output = [];
    while (output.length < n) {
        const num =
            Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min) + 1)) +
            Math.ceil(min);
        if (!output.includes(num)) {
            output.push(num);
        }
    }
    return output;
}

export function randomElementInArray(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

export function makeStreamOnlineMessages(streamMessage, users) {
    const messages = [];
    let buf = streamMessage;
    for (const user of users) {
        const combinedMessage = `${buf} @${user}`;
        if (combinedMessage.length > 450) {
            messages.push(buf.trim());
            buf = `@${user}`;
        } else {
            buf = combinedMessage;
        }
    }
    messages.push(buf.trim());
    return messages;
}

export function formatInt(number) {
    return number.toLocaleString();
}

export default {
    timeDifference,
    formattedTimeAgoString,
    truncateString,
    randomNumber,
    randomNumbersUnique,
    randomElementInArray,
    makeStreamOnlineMessages,
};
