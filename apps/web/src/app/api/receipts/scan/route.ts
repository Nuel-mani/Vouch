import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { validateSession } from '@vouch/auth';

// Gemini AI Receipt Scanner
// This endpoint accepts an image file and uses Google Gemini to extract expense data

export async function POST(request: NextRequest) {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await validateSession(token);
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get('image') as File;

        if (!file) {
            return NextResponse.json({ error: 'No image provided' }, { status: 400 });
        }

        // Convert file to base64
        const bytes = await file.arrayBuffer();
        const base64 = Buffer.from(bytes).toString('base64');
        const mimeType = file.type || 'image/jpeg';

        // Check for Gemini API key
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            // Return mock data for development
            return NextResponse.json({
                success: true,
                data: {
                    vendor: 'Sample Vendor',
                    amount: 5000,
                    date: new Date().toISOString().split('T')[0],
                    category: 'Office Supplies',
                    description: 'Receipt scanned (Gemini API not configured)',
                    vatAmount: 375, // 7.5%
                    hasVatNumber: false,
                },
                mock: true,
            });
        }

        // Call Gemini Vision API
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: `Analyze this receipt image and extract the following information in JSON format:
{
  "vendor": "Name of the vendor/store",
  "amount": total amount as a number (no currency symbols),
  "date": "YYYY-MM-DD format",
  "category": "One of: Food & Drinks, Transport, Office Supplies, Utilities, Professional Services, Marketing, Equipment, Other",
  "description": "Brief description of the purchase",
  "vatAmount": VAT/tax amount if shown (as number),
  "hasVatNumber": true if a VAT/TIN number is visible on receipt,
  "vatNumber": "The VAT/TIN number if visible"
}

If you cannot determine a value, use null. Respond ONLY with the JSON object, no other text.`,
                                },
                                {
                                    inlineData: {
                                        mimeType,
                                        data: base64,
                                    },
                                },
                            ],
                        },
                    ],
                    generationConfig: {
                        temperature: 0.1,
                        maxOutputTokens: 1024,
                    },
                }),
            }
        );

        if (!response.ok) {
            const error = await response.text();
            console.error('Gemini API error:', error);
            return NextResponse.json(
                { error: 'Failed to analyze receipt' },
                { status: 500 }
            );
        }

        const result = await response.json();
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            return NextResponse.json(
                { error: 'No response from AI' },
                { status: 500 }
            );
        }

        // Parse JSON from response (handle markdown code blocks)
        let parsed;
        try {
            // Remove markdown code blocks if present
            const jsonStr = text.replace(/```json\n?|\n?```/g, '').trim();
            parsed = JSON.parse(jsonStr);
        } catch (e) {
            console.error('Failed to parse Gemini response:', text);
            return NextResponse.json(
                { error: 'Failed to parse receipt data' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                vendor: parsed.vendor || null,
                amount: parsed.amount || null,
                date: parsed.date || new Date().toISOString().split('T')[0],
                category: parsed.category || 'Other',
                description: parsed.description || null,
                vatAmount: parsed.vatAmount || null,
                hasVatNumber: parsed.hasVatNumber || false,
                vatNumber: parsed.vatNumber || null,
            },
        });
    } catch (error) {
        console.error('Receipt scan error:', error);
        return NextResponse.json(
            { error: 'Failed to process receipt' },
            { status: 500 }
        );
    }
}
