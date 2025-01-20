import { NextResponse } from 'next/server';
import { parseCV } from "@/lib/pdf/parser";

export async function GET() {
  try {
    console.log("GET request received");
    console.log("OPENAI_API_KEY:", process.env.OPENAI_API_KEY);

    const { parseCV } = await import("@/lib/pdf/parser");
    console.log("parseCV dynamically imported successfully:", typeof parseCV);
    
    return NextResponse.json({ status: 'API route is working' });
  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message }, 
      { status: 500 }
    );
  }
}

