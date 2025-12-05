import { NextRequest, NextResponse } from 'next/server';

// OpenAI API를 호출하여 ECharts 설정을 생성하는 API 라우트
export async function POST(request: NextRequest) {
  try {
    const { prompt, image, previousChartConfig, apiKey: clientApiKey } = await request.json();

    // 클라이언트에서 전달된 API 키만 사용 (로컬 스토리지에서 가져온 키)
    const apiKey = clientApiKey;
    
    if (!apiKey) {
      // API 키가 없으면 에러 반환 (클라이언트에서 폴백 처리)
      return NextResponse.json(
        { error: 'OpenAI API 키가 설정되지 않았습니다. 설정 메뉴에서 API 키를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 프롬프트에서 이미지 데이터 추출 요청 여부 확인
    const promptLower = prompt.toLowerCase();
    const extractImageDataKeywords = [
      '이미지 데이터 추출',
      '이미지에서 데이터',
      '이미지의 데이터',
      '사진 데이터',
      '이미지 분석',
      '이미지에서 추출',
      '이미지 추출',
      '사진에서 데이터',
      'image data',
      'extract from image',
      'analyze image',
      'image에서',
      '사진에서'
    ];
    const shouldExtractImageData = image && extractImageDataKeywords.some(keyword => 
      promptLower.includes(keyword.toLowerCase())
    );

    // 시스템 프롬프트: ECharts 설정 생성 전문가
    const systemPrompt = `You are an expert data visualization assistant specializing in ECharts (Apache ECharts).

Your task is to analyze the user's request and data, then generate a complete ECharts configuration in JSON format.

IMPORTANT RULES:
1. Return ONLY valid JSON, no markdown code blocks, no explanations
2. The JSON must be a valid ECharts option object
3. The user's prompt may contain:
   - "요구사항:" section: describes what kind of chart they want (chart type, styling, features, etc.)
   - "데이터:" section: contains the actual data to visualize (tables, lists, values, etc.)
   - Extract BOTH the requirements AND the data from the prompt
   - Use the requirements to determine chart type, styling, and features
   - Use the data section to extract actual values, labels, and categories
4. IMPORTANT: If the user requests to connect data points with lines (e.g., "같은 브랜드의 제품들을 선으로 연결", "connect with lines", "line connection"), you MUST:
   - Create a scatter chart with line connections
   - Group data points by the same category/brand
   - For each group, create a series with both scatter points AND line connections
   - Use type: 'scatter' with lineStyle and connectNulls: false OR create separate line series
   - To connect points within the same series, use type: 'line' with symbol: 'circle' and symbolSize for bubble size
   - Alternatively, use scatter type with lineStyle: { show: true } and ensure points are ordered correctly
${shouldExtractImageData 
  ? `4. Extract and use ACTUAL DATA VALUES from the IMAGE provided by the user. The user explicitly requested to extract data from the image, so analyze the image carefully and extract all numerical values, labels, categories, and data points shown in the image.`
  : `4. Extract and use ACTUAL DATA VALUES from the user's TEXT PROMPT only - NEVER use data from images
5. If an image is provided, use it ONLY as a reference for:
   - Chart type/style (bar, line, pie, etc.)
   - Visual layout and structure
   - Color scheme and styling
   - Axis configuration
   - DO NOT extract or use any data values from the image`}
${shouldExtractImageData ? '5' : '6'}. Choose the most appropriate chart type based on the DATA and request:
   - bar/column: for comparing categories
   - line: for trends over time
   - pie/donut: for proportions/percentages
   - scatter/bubble: for relationships between variables
   - slope: for comparing two values (e.g., before/after, normal/sale price)
6. Include proper labels, tooltips, and styling
7. Use Korean labels if the user's prompt is in Korean
8. Set backgroundColor to "transparent"
9. Use modern, clean styling with colors: #5470c6, #91cc75, #fac858, #ee6666, #73c0de, #3ba272

Example ECharts configuration structure:
{
  "backgroundColor": "transparent",
  "tooltip": {
    "trigger": "axis",
    "backgroundColor": "rgba(255, 255, 255, 0.95)",
    "borderColor": "#e5e7eb",
    "borderWidth": 1,
    "textStyle": { "color": "#1a1a1a" }
  },
  "xAxis": {
    "type": "category",
    "data": ["Category1", "Category2", "Category3"],
    "axisLine": { "lineStyle": { "color": "#d1d5db" } },
    "axisLabel": { "color": "#6b7280", "fontSize": 12 }
  },
  "yAxis": {
    "type": "value",
    "name": "Value",
    "axisLine": { "lineStyle": { "color": "#d1d5db" } },
    "axisLabel": { "color": "#6b7280", "fontSize": 11 },
    "splitLine": { "lineStyle": { "color": "#e5e7eb", "type": "dashed" } }
  },
  "series": [{
    "type": "bar",
    "data": [120, 200, 150],
    "itemStyle": { "color": "#5470c6" }
  }]
}

Example for scatter chart with line connections (when user requests connecting points):
{
  "xAxis": { "type": "value", "name": "X Axis" },
  "yAxis": { "type": "value", "name": "Y Axis" },
  "series": [
    {
      "name": "Brand1",
      "type": "line",
      "symbol": "circle",
      "symbolSize": [value1, value2, value3],
      "data": [[x1, y1], [x2, y2], [x3, y3]],
      "lineStyle": { "width": 2, "color": "#5470c6" },
      "itemStyle": { "color": "#5470c6" }
    },
    {
      "name": "Brand2",
      "type": "line",
      "symbol": "diamond",
      "symbolSize": [value1, value2],
      "data": [[x1, y1], [x2, y2]],
      "lineStyle": { "width": 2, "color": "#91cc75" },
      "itemStyle": { "color": "#91cc75" }
    }
  ]
}
IMPORTANT: When connecting points with lines:
- Use "type": "line" (NOT "scatter")
- Set "symbol" to show markers (circle, diamond, triangle, rect, etc.)
- Set "symbolSize" as an array matching data points for bubble sizes
- Group data by the connecting category (e.g., brand) and create one series per group
- Sort data points within each series by x-axis value for proper line connection
- Each series represents one group/brand and connects its points with a line

${previousChartConfig ? `\nThe user wants to improve/modify an existing chart. Previous chart config: ${JSON.stringify(previousChartConfig)}` : ''}

Return ONLY the JSON object, nothing else.`;

    // 메시지 구성
    const messages: any[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ];

    // 이미지가 있으면 Vision API 사용
    const hasImage = !!image;
    if (image) {
      // 프롬프트에서 이미지 데이터 추출 요청 여부 확인
      const promptLower = prompt.toLowerCase();
      const extractImageDataKeywords = [
        '이미지 데이터 추출',
        '이미지에서 데이터',
        '이미지의 데이터',
        '사진 데이터',
        '이미지 분석',
        '이미지에서 추출',
        '이미지 추출',
        '사진에서 데이터',
        'image data',
        'extract from image',
        'analyze image',
        'image에서',
        '사진에서'
      ];
      
      const shouldExtractImageData = extractImageDataKeywords.some(keyword => 
        promptLower.includes(keyword.toLowerCase())
      );
      
      if (shouldExtractImageData) {
        // 이미지 데이터 추출 모드
        console.log('📸 이미지 데이터 추출 모드 - 이미지에서 데이터를 추출하여 차트 생성');
        messages.push({
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}`
              }
            },
            {
              type: 'text',
              text: '이 이미지에서 데이터를 추출하여 차트를 생성해주세요. 이미지에 표시된 숫자, 라벨, 카테고리 등의 실제 데이터 값을 정확히 추출하여 ECharts 설정에 반영해주세요. 이미지의 차트 스타일과 레이아웃도 함께 참고하세요.'
            }
          ]
        });
      } else {
        // 스타일 참고 모드 (기본)
        console.log('📸 이미지 참고 모드 - 차트 스타일/유형 참고용 (데이터는 텍스트에서 추출)');
        messages.push({
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}`
              }
            },
            {
              type: 'text',
              text: '이 이미지는 차트의 스타일, 레이아웃, 유형을 참고하기 위한 것입니다. 이미지의 실제 데이터 값은 사용하지 마세요. 대신 사용자가 텍스트로 제공한 데이터만 사용하여 차트를 생성해주세요. 이미지의 차트 스타일과 구조를 참고하되, 데이터는 반드시 텍스트 프롬프트에서 추출한 값만 사용하세요.'
            }
          ]
        });
      }
    } else {
      console.log('📝 텍스트만 사용 - 이미지 없음');
    }

    // OpenAI API 호출
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: image ? 'gpt-4o' : 'gpt-4o-mini', // Vision API는 gpt-4o 사용
        messages: messages,
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenAI API 오류:', errorData);
      
      // 429 오류 (quota exceeded) 처리
      if (response.status === 429) {
        const errorMessage = errorData.error?.message || '';
        if (errorMessage.includes('quota') || errorMessage.includes('billing')) {
          throw new Error('OpenAI API 사용량 한도를 초과했습니다. 결제 정보를 확인하거나 사용량을 확인해주세요. (https://platform.openai.com/account/billing)');
        }
      }
      
      throw new Error(`OpenAI API 오류: ${response.status} ${errorData.error?.message || ''}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    // 사용된 토큰 정보 및 비용 계산
    if (data.usage) {
      const modelName = image ? 'gpt-4o' : 'gpt-4o-mini';
      
      // 모델별 가격 (per 1M tokens)
      const pricing: { [key: string]: { input: number; output: number } } = {
        'gpt-4o-mini': { input: 0.15, output: 0.60 },
        'gpt-4o': { input: 2.50, output: 10.00 }
      };
      
      const modelPricing = pricing[modelName] || pricing['gpt-4o-mini'];
      const inputCost = (data.usage.prompt_tokens / 1_000_000) * modelPricing.input;
      const outputCost = (data.usage.completion_tokens / 1_000_000) * modelPricing.output;
      const totalCost = inputCost + outputCost;
      
      console.log('📊 API 사용량:', {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
        model: image ? 'gpt-4o (Vision)' : 'gpt-4o-mini',
        hasImage: hasImage
      });
      
      console.log('💰 예상 비용:', {
        입력비용: `$${inputCost.toFixed(6)}`,
        출력비용: `$${outputCost.toFixed(6)}`,
        총비용: `$${totalCost.toFixed(6)}`,
        원화환산: `약 ₩${(totalCost * 1300).toFixed(2)}` // 1 USD = 1300 KRW 가정
      });
    }

    if (!content) {
      throw new Error('OpenAI API에서 응답을 받지 못했습니다.');
    }
    
    if (hasImage) {
      if (shouldExtractImageData) {
        console.log('✅ 이미지 데이터 추출 완료 - Vision API 응답 수신');
      } else {
        console.log('✅ 이미지 스타일 참고 완료 - Vision API 응답 수신');
      }
    }

    // JSON 파싱
    let chartConfig;
    try {
      // 마크다운 코드 블록 제거
      const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      chartConfig = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('JSON 파싱 오류:', parseError);
      console.error('원본 응답:', content);
      throw new Error('LLM 응답을 JSON으로 파싱할 수 없습니다.');
    }

    // 비용 계산
    let costInfo = null;
    if (data.usage) {
      const modelName = image ? 'gpt-4o' : 'gpt-4o-mini';
      const pricing: { [key: string]: { input: number; output: number } } = {
        'gpt-4o-mini': { input: 0.15, output: 0.60 },
        'gpt-4o': { input: 2.50, output: 10.00 }
      };
      const modelPricing = pricing[modelName] || pricing['gpt-4o-mini'];
      const inputCost = (data.usage.prompt_tokens / 1_000_000) * modelPricing.input;
      const outputCost = (data.usage.completion_tokens / 1_000_000) * modelPricing.output;
      const totalCost = inputCost + outputCost;
      
      costInfo = {
        input: inputCost,
        output: outputCost,
        total: totalCost,
        currency: 'USD'
      };
    }

    return NextResponse.json({
      chartConfig: chartConfig,
      debug: {
        hasImage: hasImage,
        extractImageData: shouldExtractImageData || false,
        model: image ? 'gpt-4o' : 'gpt-4o-mini',
        tokensUsed: data.usage ? {
          prompt: data.usage.prompt_tokens,
          completion: data.usage.completion_tokens,
          total: data.usage.total_tokens
        } : null,
        cost: costInfo
      }
    });
  } catch (error: any) {
    console.error('차트 생성 API 오류:', error);
    return NextResponse.json(
      { error: error.message || '차트 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
}

