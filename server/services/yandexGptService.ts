import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

interface GenerateQuestionsParams {
  content: string;
  numberOfQuestions: number;
  difficulty: "easy" | "medium" | "hard" | "mixed";
  category?: string;
}

interface GeneratedQuestion {
  questionText: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  difficulty: string;
  order: number;
}

interface GeneratedQuiz {
  questions: GeneratedQuestion[];
}

export const generateQuestionsFromText = async (
  params: GenerateQuestionsParams,
): Promise<GeneratedQuiz> => {
  const { content, numberOfQuestions, difficulty, category } = params;

  const YANDEX_API_KEY = process.env.YANDEX_API_KEY;
  const FOLDER_ID = process.env.YANDEX_FOLDER_ID;

  if (!YANDEX_API_KEY || !FOLDER_ID) {
    throw new Error(
      "YandexGPT credentials are missing. Check YANDEX_API_KEY and YANDEX_FOLDER_ID in .env",
    );
  }

  const truncatedContent = content.substring(0, 6000);

  const difficultyText = {
    easy: "простые, базового уровня",
    medium: "средней сложности, требующие понимания материала",
    hard: "сложные, требующие глубокого анализа",
    mixed: "разного уровня сложности",
  };

  const prompt = `Ты — эксперт по созданию учебных тестов. Сгенерируй ${numberOfQuestions} вопросов ${difficultyText[difficulty]} на основе предоставленного текста.

Правила:
1. Каждый вопрос должен иметь 4 варианта ответа
2. Только один вариант должен быть правильным
3. Вопросы должны проверять понимание ключевых концепций из текста

Формат ответа: ТОЛЬКО JSON-массив без дополнительного текста или пояснений.

Каждый вопрос должен содержать поля:
- "text": текст вопроса
- "options": массив из 4 строк с вариантами ответов
- "correctAnswer": индекс правильного ответа (0, 1, 2 или 3)
- "explanation": краткое пояснение

Пример:
[
  {
    "text": "Что такое JavaScript?",
    "options": ["Язык программирования", "База данных", "Операционная система", "Браузер"],
    "correctAnswer": 0,
    "explanation": "JavaScript — это язык программирования"
  }
]

Вот текст для генерации вопросов:
${truncatedContent}`;

  try {
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

    let cleanResponse = aiResponse.trim();
    if (cleanResponse.startsWith("```json")) {
      cleanResponse = cleanResponse
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "");
    } else if (cleanResponse.startsWith("```")) {
      cleanResponse = cleanResponse.replace(/```\n?/g, "");
    }

    const questions = JSON.parse(cleanResponse);

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error("YandexGPT returned invalid response format");
    }

    // Трансформация вопросов под схему базы данных (БЕЗ mongoose)
    const transformedQuestions = questions.map((q: any, index: number) => ({
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${index}`, // Уникальный ID без mongoose
      questionText: q.text,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || "",
      difficulty: difficulty,
      order: index,
    }));

    console.log(
      `Successfully generated ${transformedQuestions.length} questions`,
    );

    return { questions: transformedQuestions };
  } catch (error: any) {
    console.error("YandexGPT generation error:", error.message);
    if (error.response) {
      console.error("API Response:", error.response.data);
    }
    throw new Error(`Failed to generate quiz with YandexGPT: ${error.message}`);
  }
};
