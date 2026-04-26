import axios from "axios";

export async function generateQuestionsWithYandexGPT(
  text,
  count = 5,
  difficulty = "medium",
) {
  try {
    const prompt = `Ты — эксперт по созданию образовательных тестов. На основе следующего текста:

        ${text.substring(0, 8000)}

        Сгенерируй ${count} тестовых вопросов (уровень сложности: ${difficulty}).
        Для каждого вопроса укажи 4 варианта ответа и один правильный.
        Ответ ДОЛЖЕН БЫТЬ ТОЛЬКО в формате JSON. Никакого другого текста.
        
        Формат:
        [
            {
                "question": "текст вопроса",
                "options": ["вариант1", "вариант2", "вариант3", "вариант4"],
                "correct": 0
            }
        ]
        Где correct - индекс правильного ответа (0-3)`;

    const response = await axios.post(
      "https://llm.api.cloud.yandex.net/foundationModels/v1/completion",
      {
        modelUri: `gpt://${process.env.YANDEX_GPT_FOLDER_ID}/yandexgpt-lite`,
        completionOptions: {
          stream: false,
          temperature: 0.7,
          maxTokens: 4000,
        },
        messages: [
          {
            role: "system",
            text: "Ты помощник для генерации тестовых вопросов. Отвечаешь только JSON.",
          },
          {
            role: "user",
            text: prompt,
          },
        ],
      },
      {
        headers: {
          Authorization: `Api-Key ${process.env.YANDEX_GPT_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    const aiResponse = response.data.result.alternatives[0].message.text;
    const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);

    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return generateFallbackQuestions(text, count);
  } catch (error) {
    console.error("Yandex GPT error:", error.message);
    return generateFallbackQuestions(text, count);
  }
}

function generateFallbackQuestions(text, count) {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 30);
  const questions = [];

  for (let i = 0; i < Math.min(count, sentences.length); i++) {
    const sentence = sentences[i].trim();
    const words = sentence.split(" ");

    if (words.length < 5) continue;

    questions.push({
      question: `О чем говорится в следующем предложении: "${sentence.substring(0, 100)}..."?`,
      options: [
        "О главной теме текста",
        "О второстепенной детали",
        "О примере из текста",
        "О выводе автора",
      ],
      correct: 0,
    });
  }

  while (questions.length < count) {
    questions.push({
      question: "Какова основная идея данного текста?",
      options: [
        "Идея выражена в первом абзаце",
        "Идея выражена в последнем абзаце",
        "Идея распределена по всему тексту",
        "В тексте нет явно выраженной идеи",
      ],
      correct: 2,
    });
  }

  return questions.slice(0, count);
}
