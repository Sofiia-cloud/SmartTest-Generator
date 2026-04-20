import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

interface GenerateQuizParams {
  content: string;
  numberOfQuestions: number;
  difficulty: "easy" | "medium" | "hard" | "mixed";
  category?: string;
}

interface GeneratedQuestion {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: string;
}

interface GeneratedQuizResponse {
  questions: GeneratedQuestion[];
}

/**
 * Generate quiz questions from document content using Yandex GPT API
 */
export const generateQuizWithAI = async (
  params: GenerateQuizParams,
): Promise<GeneratedQuizResponse> => {
  try {
    const { content, numberOfQuestions, difficulty, category } = params;

    console.log(
      `Generating ${numberOfQuestions} ${difficulty} questions from document using Yandex GPT...`,
    );

    const YANDEX_API_KEY = process.env.YANDEX_API_KEY;
    const FOLDER_ID = process.env.YANDEX_FOLDER_ID;

    if (!YANDEX_API_KEY || !FOLDER_ID) {
      throw new Error(
        "YandexGPT credentials are missing. Check YANDEX_API_KEY and YANDEX_FOLDER_ID in .env",
      );
    }

    const difficultyInstructions = {
      easy: "Вопросы должны быть простыми и проверять базовое понимание концепций.",
      medium: "Вопросы должны требовать понимания и применения концепций.",
      hard: "Вопросы должны быть сложными и требовать глубокого анализа и критического мышления.",
      mixed:
        "Смешайте простые, средние и сложные вопросы на протяжении всего теста.",
    };

    const categoryHint = category ? `\nТема теста: ${category}` : "";

    const prompt = `Ты — эксперт по созданию учебных тестов. На основе следующего содержания документа создай ровно ${numberOfQuestions} вопросов с множественным выбором.

Содержание документа:
${content.substring(0, 4000)}

Уровень сложности: ${difficulty}
${difficultyInstructions[difficulty]}${categoryHint}

Сгенерируй тест в следующем JSON формате (ОТВЕЧАЙ ТОЛЬКО валидным JSON, без markdown-разметки):
{
  "questions": [
    {
      "id": "q1",
      "questionText": "Текст вопроса?",
      "options": ["Вариант A", "Вариант B", "Вариант C", "Вариант D"],
      "correctAnswer": 0,
      "explanation": "Почему этот ответ правильный",
      "difficulty": "easy"
    }
  ]
}

Правила:
1. Каждый вопрос должен иметь ровно 4 варианта ответа
2. correctAnswer должен быть 0-3 (индекс правильного варианта)
3. Сложность должна соответствовать запрошенному уровню (easy/medium/hard)
4. Сгенерируй ровно ${numberOfQuestions} вопросов
5. Вопросы должны проверять понимание ключевых концепций из документа
6. Объяснения должны быть понятными и образовательными
7. Отвечай ТОЛЬКО JSON объектом, без другого текста`;

    console.log(`Sending request to YandexGPT API...`);

    const response = await axios.post(
      "https://llm.api.cloud.yandex.net/foundationModels/v1/completion",
      {
        modelUri: `gpt://${FOLDER_ID}/yandexgpt-lite/latest`,
        completionOptions: {
          stream: false,
          temperature: 0.7,
          maxTokens: 4000,
        },
        messages: [
          {
            role: "system",
            text: "Ты — полезный ассистент для генерации учебных тестов. Отвечай только валидным JSON-массивом без пояснений и markdown-разметки.",
          },
          {
            role: "user",
            text: prompt,
          },
        ],
      },
      {
        headers: {
          Authorization: `Api-Key ${YANDEX_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 60000,
      },
    );

    const aiResponse = response.data.result.alternatives[0].message.text;
    console.log("YandexGPT raw response:", aiResponse.substring(0, 200));

    // Clean response from markdown
    let cleanResponse = aiResponse.trim();
    if (cleanResponse.startsWith("```json")) {
      cleanResponse = cleanResponse
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "");
    } else if (cleanResponse.startsWith("```")) {
      cleanResponse = cleanResponse.replace(/```\n?/g, "");
    }

    // Parse the JSON response
    const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid response format from YandexGPT API");
    }

    const parsedResponse: GeneratedQuizResponse = JSON.parse(jsonMatch[0]);

    // Validate and ensure we have the correct number of questions
    if (!Array.isArray(parsedResponse.questions)) {
      throw new Error("Invalid quiz format received from YandexGPT");
    }

    // Ensure each question has required fields
    const validatedQuestions = parsedResponse.questions.map((q, index) => ({
      id: q.id || `q${index + 1}`,
      questionText: q.questionText || "",
      options: q.options || [],
      correctAnswer: q.correctAnswer !== undefined ? q.correctAnswer : 0,
      explanation: q.explanation || "",
      difficulty: (q.difficulty || difficulty) as "easy" | "medium" | "hard",
    }));

    console.log(
      `Successfully generated ${validatedQuestions.length} quiz questions`,
    );

    return {
      questions: validatedQuestions.slice(0, numberOfQuestions),
    };
  } catch (error) {
    console.error(`Error generating quiz with YandexGPT: ${error}`);
    throw new Error(
      `Failed to generate quiz: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
};

// Сохраняем старое имя функции для обратной совместимости
export const generateQuizWithClaude = generateQuizWithAI;
