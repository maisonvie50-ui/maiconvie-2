const url = "https://pzqlqnmxalutgodjsmig.supabase.co/rest/v1";
const key = "sb_publishable_Qrp4vSqhfHRd6GaKN9C4BA_ryrCFA8d";

async function testSchema() {
    const res = await fetch(`${url}/order_items`, {
        method: 'POST',
        headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        },
        body: JSON.stringify([
            {
                order_id: "1f44f2a3-9dbf-4e14-93f8-df1a59a6fbf7", // fake UUID or previous
                name: "Test item",
                quantity: 1,
                status: "pending",
                category: "Khác"
            }
        ])
    });
    const data = await res.json();
    console.log("Insert with Khác:", JSON.stringify(data, null, 2));
}

testSchema().catch(console.error);
