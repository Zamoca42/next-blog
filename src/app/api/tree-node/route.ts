import { NextResponse } from "next/server";
import { getAllTreeNode } from "@/app/api/action";

export async function GET() {
  try {
    const treeNode = await getAllTreeNode();
    return NextResponse.json(treeNode);
  } catch (error) {
    console.error("Error fetching tree node:", error);
    return NextResponse.json(
      { error: "Failed to fetch tree node" },
      { status: 500 }
    );
  }
}
