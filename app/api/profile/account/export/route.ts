import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "@/lib/auth";
import { BACKEND_URL } from "@/lib/constants";

export async function GET(request: NextRequest) {
  const token = await getSessionCookie();
  if (!token) {
    return NextResponse.json(
      { success: false, message: "Unauthorized. Please log in." },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") === "csv" ? "csv" : "json";

  const backendRes = await fetch(
    `${BACKEND_URL}/profile/account/export?format=${format}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!backendRes.ok) {
    const errorData = await backendRes.json().catch(() => ({}));
    return NextResponse.json(
      {
        success: false,
        message:
          errorData?.error?.message ||
          errorData?.message ||
          "Failed to export data",
      },
      { status: backendRes.status },
    );
  }

  const blob = await backendRes.blob();
  const disposition =
    backendRes.headers.get("content-disposition") ||
    `attachment; filename="finflow-export.${format}"`;
  const contentType =
    backendRes.headers.get("content-type") ||
    (format === "csv" ? "text/csv; charset=utf-8" : "application/json; charset=utf-8");

  return new NextResponse(blob, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": disposition,
    },
  });
}
