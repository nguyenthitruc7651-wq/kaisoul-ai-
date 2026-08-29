require("dotenv").config();

const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "10mb" }));
app.use(express.static(path.join(__dirname)));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

/*
  KAI SOUL CODE
  AI CHAT API

  Sau này chỉ cần cấu hình AI_PROVIDER,
  AI_API_KEY và AI_MODEL trong .env.
*/

app.post("/api/chat", async (req, res) => {
  try {
    const { message, mode = "developer", history = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        error: "Message is required."
      });
    }

    if (!process.env.AI_API_KEY) {
      return res.status(500).json({
        error: "AI_API_KEY chưa được cấu hình trong .env"
      });
    }

    const systemPrompt = `
Bạn là KAI SOUL CODE, một AI chuyên lập trình.

Nhiệm vụ chính:
- Code Generator
- Debug AI
- Code Fix
- Explain Code
- Code Review
- Refactor
- Convert Code
- Project Builder

Coding mode hiện tại: ${mode}

Quy tắc:
1. Ưu tiên code chạy được và chính xác.
2. Khi sửa code, nếu người dùng yêu cầu full code thì trả về toàn bộ file.
3. Không tự ý bỏ chức năng đang có.
4. Khi tạo project nhiều file, ghi rõ tên từng file.
5. Phân tích lỗi trước khi sửa.
6. Code phải dễ đọc và có cấu trúc tốt.
7. Nếu có vấn đề bảo mật, phải cảnh báo.
8. Với Beginner: giải thích dễ hiểu.
9. Với Developer: giải thích ngắn gọn, tập trung vào code.
10. Với Expert: ưu tiên kiến trúc, hiệu năng và khả năng mở rộng.
11. Với Debug Mode: tập trung tìm nguyên nhân và sửa lỗi.
12. Với Game Mode: ưu tiên logic game.
13. Với Web Mode: ưu tiên HTML/CSS/JavaScript/web.
14. Với App Mode: ưu tiên kiến trúc ứng dụng.

Không được giả vờ đã chạy code nếu chưa thực sự chạy.
`;

    /*
      OpenAI-compatible API.

      Có thể đổi AI_BASE_URL và AI_MODEL
      trong .env để dùng model/provider tương thích.
    */

    const baseUrl =
      process.env.AI_BASE_URL ||
      "https://api.openai.com/v1";

    const model =
      process.env.AI_MODEL ||
      "gpt-4.1-mini";

    const messages = [
      {
        role: "system",
        content: systemPrompt
      }
    ];

    if (Array.isArray(history)) {
      for (const item of history.slice(-20)) {
        if (
          item &&
          (item.role === "user" || item.role === "assistant") &&
          typeof item.content === "string"
        ) {
          messages.push({
            role: item.role,
            content: item.content
          });
        }
      }
    }

    messages.push({
      role: "user",
      content: message.trim()
    });

    const response = await fetch(
      `${baseUrl}/chat/completions`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "Authorization":
            `Bearer ${process.env.AI_API_KEY}`
        },

        body: JSON.stringify({
          model,
          messages,
          temperature: 0.2
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("AI API ERROR:", data);

      return res.status(response.status).json({
        error:
          data?.error?.message ||
          "AI API request failed."
      });
    }

    const answer =
      data?.choices?.[0]?.message?.content;

    if (!answer) {
      return res.status(500).json({
        error: "AI không trả về nội dung."
      });
    }

    res.json({
      success: true,
      answer,
      model
    });

  } catch (error) {

    console.error("SERVER ERROR:", error);

    res.status(500).json({
      error: "Server error: " + error.message
    });
  }
});


app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "KAI SOUL CODE"
  });
});


app.listen(PORT, "0.0.0.0", () => {
  console.log("");
  console.log("================================");
  console.log("      KAI SOUL CODE");
  console.log("================================");
  console.log(`Server running on port ${PORT}`);
  console.log("");
});
