import Anthropic from '@anthropic-ai/sdk';
import { IQuizQuestion } from '../models/Quiz';

// Create client lazily to ensure env vars are loaded
let client: Anthropic | null = null;

const getClient = (): Anthropic => {
  if (!client) {
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('ERROR: ANTHROPIC_API_KEY is not set in environment variables');
      throw new Error('ANTHROPIC_API_KEY environment variable is required');
    }
    client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return client;
};

interface GenerateQuizParams {
  content: string;
  numberOfQuestions: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  category?: string;
}

interface GeneratedQuizResponse {
  questions: IQuizQuestion[];
}

/**
 * Generate quiz questions from document content using Claude API
 */
export const generateQuizWithClaude = async (params: GenerateQuizParams): Promise<GeneratedQuizResponse> => {
  try {
    const { content, numberOfQuestions, difficulty, category } = params;

    console.log(`Generating ${numberOfQuestions} ${difficulty} questions from document using Claude...`);

    const difficultyInstructions = {
      easy: 'The questions should be straightforward and test basic understanding of the concepts.',
      medium: 'The questions should require understanding and application of concepts.',
      hard: 'The questions should be challenging and require deep analysis and critical thinking.',
      mixed: 'Mix easy, medium, and hard questions throughout the quiz.',
    };

    const categoryHint = category ? `\nThe quiz is about: ${category}` : '';

    const prompt = `You are an expert quiz creator. Based on the following document content, create exactly ${numberOfQuestions} multiple-choice quiz questions.

Document Content:
${content.substring(0, 4000)}

Difficulty Level: ${difficulty}
${difficultyInstructions[difficulty]}${categoryHint}

Generate the quiz in the following JSON format (respond ONLY with valid JSON, no markdown):
{
  "questions": [
    {
      "_id": "q1",
      "questionText": "The question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Why this answer is correct",
      "difficulty": "easy"
    }
  ]
}

Rules:
1. Each question must have exactly 4 options
2. correctAnswer must be 0-3 (index of the correct option)
3. Difficulty should match the requested level (easy/medium/hard)
4. Generate exactly ${numberOfQuestions} questions
5. Questions should test understanding of key concepts from the document
6. Explanations should be clear and educational
7. Only respond with the JSON object, no other text`;

    const anthropicClient = getClient();
    // Using claude-opus as a fallback that's more widely available
    const response = await anthropicClient.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const responseText = response.content[0].type === 'text' ? response.content[0].text : '';

    // Parse the JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from Claude API');
    }

    const parsedResponse: GeneratedQuizResponse = JSON.parse(jsonMatch[0]);

    // Validate and ensure we have the correct number of questions
    if (!Array.isArray(parsedResponse.questions)) {
      throw new Error('Invalid quiz format received from Claude');
    }

    // Ensure each question has required fields
    const validatedQuestions = parsedResponse.questions.map((q, index) => ({
      _id: q._id || `q${index + 1}`,
      questionText: q.questionText || '',
      options: q.options || [],
      correctAnswer: q.correctAnswer !== undefined ? q.correctAnswer : 0,
      explanation: q.explanation || '',
      difficulty: (q.difficulty || difficulty) as 'easy' | 'medium' | 'hard',
    }));

    console.log(`Successfully generated ${validatedQuestions.length} quiz questions`);

    return {
      questions: validatedQuestions.slice(0, numberOfQuestions),
    };
  } catch (error) {
    console.error(`Error generating quiz with Claude: ${error}`);
    throw new Error(`Failed to generate quiz: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
