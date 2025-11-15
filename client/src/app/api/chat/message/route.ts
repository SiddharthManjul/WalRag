import { NextRequest, NextResponse } from "next/server";
import { ChatService, Message } from "@/services/chat-service";

export async function POST(request: NextRequest) {
  try {
    const { chatId, message } = await request.json();

    if (!chatId || !message) {
      return NextResponse.json(
        { error: "Missing required fields: chatId, message" },
        { status: 400 }
      );
    }

    const chatService = new ChatService();

    // Create the message object
    const newMessage: Message = {
      id: message.id || Date.now().toString(),
      role: message.role,
      content: message.content,
      timestamp: message.timestamp || Date.now(),
      sources: message.sources,
    };

    await chatService.addMessage(chatId, newMessage);

    return NextResponse.json({
      success: true,
      message: "Message added successfully",
    });
  } catch (error: any) {
    console.error("Error adding message:", error);
    return NextResponse.json(
      { error: error.message || "Failed to add message" },
      { status: 500 }
    );
  }
}
