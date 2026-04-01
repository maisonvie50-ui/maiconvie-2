import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS configuration
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Handle OPTIONS request for CORS preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const payload = req.body;
        console.log("Received booking sync:", payload);

        if (!payload || !payload.customerName) {
            return res.status(400).json({ error: "Missing customerName" });
        }

        const { data, error } = await supabase
            .from("bookings")
            .insert({
                customer_name: payload.customerName,
                phone: payload.phone || null,
                email: payload.email || null,
                pax: payload.pax || 2,
                booking_date: payload.bookingDate || new Date().toISOString().split("T")[0],
                time: payload.time || "18:00",
                status: payload.status || "new",
                source: payload.source || "email",
                customer_type: payload.customerType || "retail",
                booking_code: payload.bookingCode || null,
                notes: payload.notes || [],
            })
            .select()
            .single();

        if (error) {
            console.error("Supabase Error inserting booking:", error);
            return res.status(500).json({ error: error.message });
        }

        return res.status(200).json({ success: true, booking: data });
    } catch (err: any) {
        console.error("Error in booking-sync endpoint:", err);
        return res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
}
