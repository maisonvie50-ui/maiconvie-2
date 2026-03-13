const url = "https://pzqlqnmxalutgodjsmig.supabase.co/rest/v1";
const key = "sb_publishable_Qrp4vSqhfHRd6GaKN9C4BA_ryrCFA8d";

async function testInsert() {
    const res = await fetch(`${url}/orders`, {
        method: 'POST',
        headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        },
        body: JSON.stringify({
            table_name: 'Test Desk',
            status: 'pending',
            booking_status: 'confirmed',
            order_time: new Date().toISOString()
        })
    });
    const data = await res.json();
    const orderId = data[0].id;

    const res2 = await fetch(`${url}/order_items`, {
        method: 'POST',
        headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        },
        body: JSON.stringify([
            {
                order_id: orderId,
                name: "Test item",
                quantity: 1,
                notes: [],
                status: "pending",
                category: "Món chính"
            }
        ])
    });
    const data2 = await res2.json();
    console.log("Order items Insert response:", JSON.stringify(data2, null, 2));

    // cleanup
    fetch(`${url}/orders?id=eq.${orderId}`, {
        method: 'DELETE',
        headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`
        }
    })
}

testInsert().catch(console.error);
