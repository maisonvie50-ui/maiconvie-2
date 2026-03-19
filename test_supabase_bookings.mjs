import fs from 'fs';

const url = 'https://pzqlqnmxalutgodjsmig.supabase.co/rest/v1';
const key = 'sb_publishable_Qrp4vSqhfHRd6GaKN9C4BA_ryrCFA8d';

fetch(url + '/bookings?select=*&limit=1', {
    headers: {
        apikey: key,
        Authorization: `Bearer ${key}`
    }
})
    .then(r => r.json())
    .then(data => console.log(JSON.stringify(data, null, 2)))
    .catch(console.error);
