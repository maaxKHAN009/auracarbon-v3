import { NextResponse, NextRequest } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'factors.json');

/**
 * Check if user is admin (for now, check Authorization header)
 * In production, verify JWT tokens or session cookies
 */
function isAdmin(request: NextRequest): boolean {
  // Mock admin check - in production, verify JWT/session tokens
  const authHeader = request.headers.get('authorization');
  return authHeader?.includes('admin') || false;
}

/**
 * GET /api/factors - Fetch current emission factors
 */
export async function GET() {
  try {
    const data = await fs.readFile(dataFilePath, 'utf-8');
    const factors = JSON.parse(data);
    
    // Validate structure
    if (!factors.materials || !factors.fuels || !factors.grids) {
      return NextResponse.json(
        { error: 'Invalid factors data structure' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(factors);
  } catch (error) {
    console.error('Failed to read factors data:', error);
    return NextResponse.json(
      { error: 'Failed to read factors data' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/factors - Update emission factors (admin only)
 */
export async function POST(request: NextRequest) {
  // Authorization check
  if (!isAdmin(request)) {
    return NextResponse.json(
      { error: 'Unauthorized: Admin access required' },
      { status: 403 }
    );
  }

  try {
    const newData = await request.json();
    
    // Validate input structure
    if (!newData.materials || !newData.fuels || !newData.grids) {
      return NextResponse.json(
        { error: 'Invalid factors data structure. Must include: materials, fuels, grids' },
        { status: 400 }
      );
    }

    // Validate values are non-negative numbers
    const validateFactors = (factors: Record<string, number>) => {
      return Object.entries(factors).every(
        ([key, value]) => typeof value === 'number' && value >= 0
      );
    };

    if (!validateFactors(newData.materials) ||
        !validateFactors(newData.fuels) ||
        !validateFactors(newData.grids)) {
      return NextResponse.json(
        { error: 'All emission factors must be non-negative numbers' },
        { status: 400 }
      );
    }

    await fs.writeFile(dataFilePath, JSON.stringify(newData, null, 2), 'utf-8');
    return NextResponse.json({ success: true, message: 'Factors updated successfully' });
  } catch (error) {
    console.error('Failed to write factors data:', error);
    return NextResponse.json(
      { error: 'Failed to write factors data' },
      { status: 500 }
    );
  }
}
