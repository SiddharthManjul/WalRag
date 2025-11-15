import { NextRequest, NextResponse } from "next/server";
import { ChatService } from "@/services/chat-service";

export async function POST(request: NextRequest) {
  try {
    const { chatId } = await request.json();

    if (!chatId) {
      return NextResponse.json(
        { error: "Missing required field: chatId" },
        { status: 400 }
      );
    }

    const chatService = new ChatService();

    // Check and renew if needed (lazy renewal)
    await chatService.checkAndRenewChat(chatId);

    // Update last activity
    await chatService.updateLastActivity(chatId);

    // Load chat data
    const chatData = await chatService.loadChat(chatId);

    // Get expiry info
    const expiryInfo = await chatService.getChatExpiryInfo(chatId);

    return NextResponse.json({
      success: true,
      chat: chatData,
      expiryInfo,
    });
  } catch (error: any) {
    console.error("Error loading chat:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load chat" },
      { status: 500 }
    );
  }
}
