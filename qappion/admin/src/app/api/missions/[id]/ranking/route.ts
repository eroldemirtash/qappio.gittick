import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Return mock ranking data for now
    const mockRanking = [
      {
        id: "1",
        media_url: "https://via.placeholder.com/300x300/FF6B6B/FFFFFF?text=Post+1",
        created_at: "2024-01-15T10:00:00Z",
        user_id: "user1",
        likes_count: 45,
        profiles: {
          display_name: "Ahmet Yılmaz",
          avatar_url: "https://via.placeholder.com/100x100/4ECDC4/FFFFFF?text=AY"
        }
      },
      {
        id: "2", 
        media_url: "https://via.placeholder.com/300x300/45B7D1/FFFFFF?text=Post+2",
        created_at: "2024-01-14T15:30:00Z",
        user_id: "user2",
        likes_count: 32,
        profiles: {
          display_name: "Zeynep Kaya",
          avatar_url: "https://via.placeholder.com/100x100/96CEB4/FFFFFF?text=ZK"
        }
      },
      {
        id: "3",
        media_url: "https://via.placeholder.com/300x300/FFEAA7/FFFFFF?text=Post+3", 
        created_at: "2024-01-13T09:15:00Z",
        user_id: "user3",
        likes_count: 28,
        profiles: {
          display_name: "Mehmet Demir",
          avatar_url: "https://via.placeholder.com/100x100/DDA0DD/FFFFFF?text=MD"
        }
      },
      {
        id: "4",
        media_url: "https://via.placeholder.com/300x300/FF9FF3/FFFFFF?text=Post+4",
        created_at: "2024-01-12T14:20:00Z",
        user_id: "user4",
        likes_count: 24,
        profiles: {
          display_name: "Ayşe Özkan",
          avatar_url: "https://via.placeholder.com/100x100/FF9FF3/FFFFFF?text=AÖ"
        }
      },
      {
        id: "5",
        media_url: "https://via.placeholder.com/300x300/54A0FF/FFFFFF?text=Post+5",
        created_at: "2024-01-11T11:45:00Z",
        user_id: "user5",
        likes_count: 19,
        profiles: {
          display_name: "Can Arslan",
          avatar_url: "https://via.placeholder.com/100x100/54A0FF/FFFFFF?text=CA"
        }
      }
    ];

    return new Response(JSON.stringify({ 
      success: true, 
      ranking: mockRanking 
    }), {
      headers: { "content-type": "application/json", "cache-control": "no-store" }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { "content-type": "application/json", "cache-control": "no-store" }
    });
  }
}
