import { NextRequest, NextResponse } from "next/server";
import { ChatService, Message } from "@/services/chat-service";

export async function POST(request: NextRequest) {
  try {
    const { chatId, title, initialMessage } = await request.json();

    if (!chatId || !title || !initialMessage) {
      return NextResponse.json(
        { error: "Missing required fields: chatId, title, initialMessage" },
        { status: 400 }
      );
    }

    const chatService = new ChatService();

    // Create the message object
    const message: Message = {
      id: initialMessage.id || Date.now().toString(),
      role: initialMessage.role,
      content: initialMessage.content,
      timestamp: initialMessage.timestamp || Date.now(),
      sources: initialMessage.sources,
    };

    await chatService.createChat(chatId, title, message);

    return NextResponse.json({
      success: true,
      chatId,
      message: "Chat created successfully",
    });
  } catch (error: any) {
    console.error("Error creating chat:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create chat" },
      { status: 500 }
    );
  }
}
