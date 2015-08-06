import Papa from 'papaparse';
import moment from 'moment';

export function parse(text) {
    const { errors, data } = Papa.parse(text, {
        skipEmptyLines: true
    });

    if (errors.length) throw errors;

    data.shift();
    return data.map(chunk => {
        const id = chunk[0];
        const date = moment(chunk[1] + ' ' + chunk[2], 'DD/MM/YYYY HH:mm:ss.SSS');
        if (!date.isValid()) throw new Error('Not valid date');
        const amount = +chunk[3];
        if (isNaN(amount)) throw new Error('Not valid amount');
        return {
            id,
            date,
            amount
        }
    });
}
