import { NextResponse } from 'next/server';
import { parseCV } from "@/lib/pdf/parser";

export async function GET() {
  try {
    console.log("GET request received");
    // console.log("parseCV type:", typeof parseCV);
    
    return NextResponse.json({ status: 'API route is working' });
  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message }, 
      { status: 500 }
    );
  }
}

