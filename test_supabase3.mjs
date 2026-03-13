const url = "https://pzqlqnmxalutgodjsmig.supabase.co/rest/v1";
const key = "sb_publishable_Qrp4vSqhfHRd6GaKN9C4BA_ryrCFA8d";

async function testCats() {
    const res = await fetch(`${url}/menu_categories`, {
        headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`
        }
    });
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
}

testCats().catch(console.error);
