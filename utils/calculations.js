function areAllValuesEqual(arr) {
    let val = arr[0];
    for (let k in arr)
        if (arr[k] != val)
            return false;
    return true;
}


const MedianeStrategy = (payers, payments) => {
    const participants = payers.map(p => p.toString()),
        chain = [];

    let middle = 0;

    const mediane = participants.reduce(p => {
        acc[p] = 0
        return acc;
    }, {});

    // calculate how much each of payers spent 
    // & calculate middle
    payments.forEach(payment => {
        const key = payment.author.toString()
        mediane[key] -= payment.amount;
        middle += payment.amount;
    });

    // middle = general expences, everyone should equally spend this value
    middle /= participants.length;

    // calculate values for debts. < 0 = person spent less than middle 
    // | > 0 = person spent more and should receive money
    for (let p in model) {
        mediane[p] += middle;
    }

    while (!areAllValuesEqual(mediane)) {
        let min = participants[0],
            max = participants[0];

        // max - should receive money
        // min - should give his money
        for (let p of participants) {
            if (mediane[max] < mediane[p]) {
                max = p;
            }
            if (mediane[min] > mediane[p]) {
                min = p;
            }
        }

        // How much min should give to max, for someone
        // of those two to become 0 mediane
        const maxAbs = Math.abs(mediane[max]);
        const minAbs = Math.abs(mediane[min]);
        const amount = Math.min(maxAbs, minAbs);

        // add transfer to chain
        chain.push({
            to: max,
            from: min,
            amount
        });

        // apply transfer
        mediane[max] -= amount;
        mediane[min] += amount;
    }
    return chain;
}
module.exports = {
    MedianeStrategy
};