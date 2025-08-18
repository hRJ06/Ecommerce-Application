import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth/utils";
import User from "@/lib/models/user";
import dbConnect from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    console.log("CHECKING AUTHENTICATION STATUS");
    const auth = await isAuthenticated(request);
    
    if (!auth || !auth.userId) {
      console.log("NO VALID AUTHENTICATION FOUND");
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findById(auth.userId).select("-password");
    
    if (!user) {
      console.log("USER NOT FOUND - ", auth.userId);
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    console.log("USER AUTHENTICATED -", user._id);
    return NextResponse.json({
      authenticated: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });
  } catch (error) {
    console.error("AUTH CHECK ERROR:", error);
    return NextResponse.json(
      { error: "Authentication check failed" },
      { status: 401 }
    );
  }
}
